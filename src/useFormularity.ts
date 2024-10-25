import {
    FormEvent
    , useCallback
    , useEffect
    , useRef
    , useSyncExternalStore
} from 'react';

// Types
import {
    NewFieldRegistration
    , FieldRegistry
    , FormErrors
    , FormStore
    , FormStoreState
    , FormTouched
    , FormValues
    , FormularityProps
    , SingleFieldValidator
    , ValidationHandler
    , FormHandlers
    , SubmissionOrResetHelpers
    , OnSubmitOrReset
    , FieldValidationOptions
    , FieldEffectsConfig
    , FieldEffectHelpers
    , FieldEffectFn
} from './types';
import {
    CheckboxValue
    , DeepKeys
    , DeepPartial
    , DeepValue
    , NoInfer
    , Nullish
    , OnBlurEvent
    , OnChangeEvent
} from './utilityTypes';

// Hooks
import { useEventCallback } from './useEventCallback';

// Utils
import {
    getViaPath
    , objectEntries
    , objectKeys
    , isEqual
    , isEmpty
    , setViaPath
    , cloneDeep
    , deepObjectKeys
    , hasSameNestedKeys
    , getKeysWithDiffs
    , deepMerge
    , getActiveElement
    , logDevWarning
    , getFieldEffectFns
} from './generalUtils';
import {
    touchAllFields
    , getCheckboxValue
    , getMultiSelectValues
} from './formUtils';
import { getDefaultFormStoreState } from './createFormStore';

// Components
import { Field } from './Field';
import { FieldList } from './FieldList';
import { SubmitButton } from './SubmitButton';
import { ResetButton } from './ResetButton';

export type UseFormularityParams<TFormValues extends FormValues> = {
    /**
     * Formularity form store used to power the form.
     * ** All Formularity forms must use a form store (using `createFormStore`)
     * in order to work; either passed in-line to the `formStore` prop or defined
     * in an external variable and then passed to the prop by reference. The second
     * of these two approaches is more common and the recommended way to use a
     * form store, as it gives global access to the store, whereby the form state
     * can be accessed and altered outside of the form itself (i.e. by a submit button
     * that lives somewhere outside of the form in the DOM tree).
     */
    formStore: FormStore<TFormValues>;
    /**
     * optional utility property to hook up a custom "editing" state where Formularity
     * can be told if the form is currently in an editing state in order to perform certain
     * disable logic, etc.
     */
    isEditing?: FormStoreState<TFormValues>['isEditing'];
    /**
     * This option can be used to pre-populate the form with data
     * that replaces the default values passed to the form store.
     * This is a great option to use when you want to pre-populate a form
     * with data from a database or API.
     *
     * This prop essentially resets the form to the new values passed in
     * from `valuesInitializer`, so be cautious as to how you pass this new
     * values object as it can override desired values if your logic is not
     * set up properly.
     *
     */
    valuesInitializer?: NoInfer<TFormValues>;
    /**
     * Submit handler for the form. This is called when the form is submitted.
     */
    onSubmit?: OnSubmitOrReset<TFormValues>;
    /**
     * Reset handler for the form. This is called when the form is reset.
     */
    onReset?: OnSubmitOrReset<TFormValues>;
    /**
     * If set to true, the form will validate on blur.
     * @default true
     */
    validateOnBlur?: boolean;
    /**
     * If set to true, the form will validate on each field change.
     * @default true
     */
    validateOnChange?: boolean;
    /**
     * If set to true, the form will validate on submit.
     * **It is very rare that this would ever be turned off, but
     * it is included here for niche cases where that may be needed
     * @default true
     */
    validateOnSubmit?: boolean;
};

/**
 * `useFormularity` is the heart and brains of Formularity. Under the hood, it powers
 * the `<Formularity />` component and its child components. This hook may be used to manually
 * implement a custom version of Formularity, but it is recommended to only go this route if
 * absolutely necessary. It may also be used to access form state from outside of the `<Formularity />`
 * component bounds. This should also be used on a conditional basis, when absolutely needed, to
 * avoid potential, undesired side-effects.
 */
export const useFormularity = <TFormValues extends FormValues>( {
    formStore
    , isEditing = false
    , valuesInitializer
    , onSubmit
    , onReset
    , validateOnBlur = true
    , validateOnChange = true
    , validateOnSubmit = true
}: UseFormularityParams<TFormValues> ): FormularityProps<TFormValues> => {
    const currentStore = useSyncExternalStore<FormStoreState<TFormValues>>( formStore.subscribe, formStore.get );

    const validationSchema = currentStore.validationSchema;
    const manualValidationHandler = currentStore.manualValidationHandler;
    const submitHandler = currentStore.onSubmit || onSubmit;

    const initialValues = useRef( currentStore.initialValues );
    const prevValuesInitializer = useRef( cloneDeep( currentStore.initialValues ) );

    const values = currentStore.values;
    const errors = currentStore.errors;
    const touched = currentStore.touched;

    const isMounted = useRef<boolean>( false );

    const fieldRegistry = useRef<FieldRegistry<TFormValues>>( {} );

    useEffect( () => {
        isMounted.current = true;

        return () => {
            isMounted.current = false;
        };
    }, [] );

    useEffect( () => {
        if (
            valuesInitializer
            && isMounted.current
            && !isEqual( prevValuesInitializer.current, valuesInitializer )
        ) {
            resetForm( valuesInitializer );

            prevValuesInitializer.current = cloneDeep( valuesInitializer );
        }
    }, [ valuesInitializer ] );

    const registerField = useCallback(
        <TFieldName extends DeepKeys<TFormValues>>(
            newFieldRegistration: NewFieldRegistration<TFormValues, TFieldName>
        ) => {
            const {
                name
                , ...fieldRegistryProps
            } = newFieldRegistration;

            if ( fieldRegistry.current[ name ] ) return;

            fieldRegistry.current[ name ]
                = { ...fieldRegistryProps } as FieldRegistry<TFormValues>[TFieldName];
        }
        , []
    );

    const unregisterField = useCallback(
        <TFieldName extends DeepKeys<TFormValues>>( fieldName: TFieldName ) => {
            delete fieldRegistry.current[ fieldName ];
        }
        , []
    );

    const _validate = useEventCallback( async (
        values: TFormValues,
        options?: { updateStore?: boolean }
    ) => {
        const updateStore = options?.updateStore ?? true;

        let newErrors: DeepPartial<FormErrors<TFormValues>> = {};

        const singleValidatorKeys = objectEntries( fieldRegistry.current )
            .filter( ( [ _, registration ] ) => !!registration?.validationHandlers )
            .map( ( [ key ] ) => key );

        const validationRunner = async ( validationHandlerToRun?: ValidationHandler<TFormValues> ) => {
            const validationErrors = await validationHandlerToRun?.( values );

            if ( validationErrors ) {
                newErrors = validationErrors;
            }

            if ( singleValidatorKeys.length ) {
                for ( const error in newErrors ) {
                    if ( singleValidatorKeys.includes( error as DeepKeys<TFormValues> ) ) {
                        delete newErrors[ error as keyof Partial<FormErrors<TFormValues>> ];
                    }
                }

                newErrors = await runAllSingleFieldValidators( newErrors );
            }

            // If the errors haven't changed, skip render cycle and just return the errors
            if ( isEqual( newErrors, errors ) ) return;

            updateStore && setErrors( newErrors );
        };

        switch ( true ) {
            case !!validationSchema: await validationRunner( validationSchema );
                break;
            case !!manualValidationHandler: await validationRunner( manualValidationHandler );
                break;
            default: await validationRunner();
        }

        return newErrors;
    } );

    const validateField = useEventCallback( async <TFieldName extends DeepKeys<TFormValues>>(
        fieldName: TFieldName
        , options?: {
            validators?: SingleFieldValidator<TFormValues, TFieldName> | Array<SingleFieldValidator<TFormValues, TFieldName>>;
            shouldTouchField?: boolean;
        }
    ) => {
        const validator = options?.validators;
        const shouldTouchField = options?.shouldTouchField ?? true;

        const validatorToRun
                = validator
                || fieldRegistry.current?.[ fieldName as keyof FieldRegistry<TFormValues> ]?.validationHandlers as typeof validator;

        if ( !validatorToRun ) {
            logDevWarning(
                `Field: ${ fieldName } must have a validator prop set or ' +
                'an inline validator must be passed as a second argument in order to use validateField.`
            );

            return null;
        }

        const errorOrNull = await runSingleFieldValidations( validatorToRun, fieldName );
        const newTouched = shouldTouchField ? setViaPath( touched, fieldName, true ) : touched;
        const newErrors = errorOrNull ? setViaPath( errors, fieldName, errorOrNull ) : errors;

        formStore.set( {
            touched: newTouched
            , errors: newErrors
        } );

        return errorOrNull;
    } );

    const runSingleFieldValidations = useEventCallback( async <TFieldName extends DeepKeys<TFormValues>>(
        fieldValidators: SingleFieldValidator<TFormValues, TFieldName> | Array<SingleFieldValidator<TFormValues, TFieldName>>
        , fieldName: TFieldName
    ) => {
        const fieldValue = getViaPath( values, fieldName );

        let fieldErrorsOrNull: string | Nullish = null;

        if ( Array.isArray( fieldValidators ) ) {
            for ( const validator of fieldValidators ) {
                const newErrorOrNull = await validator( fieldValue!, {
                    fieldName
                    , formValues: values
                } );

                if ( newErrorOrNull ) {
                    fieldErrorsOrNull = [ fieldErrorsOrNull, newErrorOrNull ]
                        .filter( Boolean )
                        .join( ', ' );
                }
            }
        } else {
            fieldErrorsOrNull = await fieldValidators( fieldValue!, {
                fieldName
                , formValues: values
            } );

        }

        return fieldErrorsOrNull;
    } );

    const runAllSingleFieldValidators = useEventCallback( async ( errors: DeepPartial<FormErrors<TFormValues>> ) => {
        for ( const [ fieldName, registration ] of objectEntries( fieldRegistry.current ) ) {
            const fieldErrorOrNull = registration?.validationHandlers
                ? await runSingleFieldValidations( registration?.validationHandlers, fieldName )
                : null;

            if ( fieldErrorOrNull ) {
                errors = setViaPath(
                    errors,
                    fieldName as DeepKeys<DeepPartial<FormErrors<TFormValues>>>
                    , fieldErrorOrNull
                );
            }
        }

        return errors;
    } );

    const validateForm: FormHandlers<TFormValues>['validateForm'] = useEventCallback( async options => {
        const shouldTouchAllFields = options?.shouldTouchAllFields ?? true;

        const validationErrors = await _validate( values, { updateStore: false } );

        formStore.set( {
            touched: shouldTouchAllFields ? touchAllFields( values ) : touched
            , errors: validationErrors as FormErrors<TFormValues>
        } );

        return validationErrors as FormErrors<TFormValues>;
    } );

    const setFieldValue: FormHandlers<TFormValues>['setFieldValue']
    = useEventCallback( ( fieldName, newValue, options ) => {
        const shouldValidate = options?.shouldValidate !== undefined
            ? options.shouldValidate
            : validateOnChange;

        const validationEvent = options?.validationEvent ?? 'all';

        let newValues = setViaPath( values, fieldName, newValue );

        if ( shouldValidate ) {
            switch ( validationEvent ) {
                case 'all':
                case 'onChange': {
                    formStore.set( { values: newValues } );
                    _validate( newValues );
                    break;
                }
                case 'onBlur': {
                    formStore.set( { values: newValues } );
                    break;
                }
            }
        } else {
            formStore.set( { values: newValues } );
        }

        const fieldEffects = getFieldEffectFns( fieldRegistry.current, fieldName as never, 'change' );

        // Run onChange field effects
        if ( fieldEffects ) {
            fieldEffects.forEach( ( [ targetFieldName, effect ] ) => {
                const fieldEffect = effect as FieldEffectFn<TFormValues, DeepKeys<TFormValues>, DeepKeys<TFormValues>>;
                const listenFieldName = fieldName;
                const listenFieldVal = getViaPath( newValues, listenFieldName as never ) as DeepValue<TFormValues, DeepKeys<TFormValues>>;

                const helpers: FieldEffectHelpers<TFormValues, DeepKeys<TFormValues>> = {
                    setValue: val => {
                        newValues = setViaPath( newValues, targetFieldName, val );
                        formStore.set( { values: newValues } );
                    }
                    , setError: error => setFieldError( fieldName, error )
                    , setTouched: touched => setFieldTouched( fieldName, touched )
                    , validateField: ( touchField, customValidator ) => {
                        // TODO: need to figure this out
                    }
                };

                fieldEffect(
                    listenFieldVal
                    , newValue
                    , helpers
                );
            } );
        }
    } );

    // TODO: add options object with validation options
    const setValues = useCallback( ( newValues: DeepPartial<TFormValues> ) => {
        const mergedValues = deepMerge( values, newValues );
        formStore.set( { values: mergedValues } );

        validateOnChange && _validate( mergedValues );
    }, [] );

    const setFieldError = useCallback( ( fieldName: DeepKeys<TFormValues>, newError: string ) => {
        const newFieldErrors = setViaPath(
            errors
            , fieldName as DeepKeys<FormErrors<TFormValues>>
            , newError
        );

        formStore.set( { errors: newFieldErrors } );
    }, [] );

    const setErrors = useCallback( ( newErrors: DeepPartial<FormErrors<TFormValues>> ) => {
        formStore.set( { errors: deepMerge( errors, newErrors ) } );
    }, [] );

    const setFieldTouched = useEventCallback( async (
        fieldName: DeepKeys<TFormValues>
        , newTouched: boolean
        , fieldValidationOptions?: FieldValidationOptions
    ) => {
        const newFieldTouched = setViaPath(
            touched
            , fieldName as DeepKeys<FormTouched<TFormValues>>
            , newTouched
        );

        const fieldValidationEvent = fieldValidationOptions?.validationEvent || 'all';
        const shouldValidateFieldOnBlur
            = fieldValidationEvent === 'onBlur'
            || fieldValidationEvent === 'all'
            || validateOnBlur;

        const newErrors = shouldValidateFieldOnBlur
            ? await _validate( values, { updateStore: false } )
            : errors;

        formStore.set( {
            touched: newFieldTouched
            , errors: newErrors as FormErrors<TFormValues>
        } );

        // Run onBlur field effects
        // if ( onBlurFieldEffects ) {
        //     objectEntries( onBlurFieldEffects as object ).forEach( ( [ effectFieldName, effect ] ) => {
        //         const fieldEffect = effect as FieldEffectFn<TFormValues, DeepKeys<TFormValues>, DeepKeys<TFormValues>>;
        //         const fieldVal = getViaPath( values, effectFieldName ) as DeepValue<TFormValues, DeepKeys<TFormValues>>;

        //         const helpers: FieldEffectHelpers<TFormValues, DeepKeys<TFormValues>> = {
        //             setValue: val => {
        //                 const newValues = setViaPath( values, effectFieldName, val );
        //                 formStore.set( { values: newValues } );
        //             }
        //             , setError: error => setFieldError( effectFieldName, error )
        //             , setTouched: touched => setFieldTouched( effectFieldName, touched )
        //             , validateField: touchField => validateField( effectFieldName, { shouldTouchField: !!touchField } )
        //         };

        //         fieldEffect(
        //             fieldVal
        //             , getViaPath( values, fieldName ) as DeepValue<TFormValues, DeepKeys<TFormValues>>
        //             , helpers
        //         );
        //     } );
        // }
    } );

    const setTouched = useCallback( ( newTouched: FormTouched<TFormValues> ) => {
        if ( isEqual( touched, newTouched ) ) return;

        // TODO: Not sure this condition is right. check if this is needed
        validateOnBlur && formStore.set( { touched: newTouched } );
    }, [] );

    const handleChange = useEventCallback( (
        e: OnChangeEvent
        , fieldValidationOptions?: FieldValidationOptions
    ) => {
        let finalValue;

        const fieldName = e.target.name as DeepKeys<TFormValues>;
        const {
            value
            , type
        } = e.target;

        const {
            options
            , multiple
        } = e.target as HTMLSelectElement;

        const { checked } = e.target as HTMLInputElement;

        // determine field type -> number, range, checkbox, multiselect or other stock input
        switch ( true ) {
            case /number|range/.test( type ): {
                const parsedValue = parseFloat( value );

                if ( isNaN( parsedValue ) ) {
                    finalValue = '';
                } else {
                    finalValue = parsedValue;
                }
            }
                break;
            case ( /checkbox/.test( type ) || checked ):
                finalValue = getCheckboxValue(
                    getViaPath( values, fieldName ) as CheckboxValue
                    , checked
                    , value
                );
                break;
            case options && multiple:
                finalValue = getMultiSelectValues( options );
                break;
            default: finalValue = value;
        }

        setFieldValue(
            fieldName as never
            , finalValue as DeepValue<TFormValues, DeepKeys<TFormValues>>
            , fieldValidationOptions
        );
    } );

    const handleBlur = useEventCallback( (
        e: OnBlurEvent
        , fieldValidationOptions?: FieldValidationOptions
    ) => {
        const fieldName = e.target.name as DeepKeys<TFormValues>;

        setFieldTouched( fieldName, true, fieldValidationOptions );
    } );

    const resetForm = useEventCallback( ( newFormValues?: DeepPartial<TFormValues> ) => {
        formStore.set( {
            ...getDefaultFormStoreState( initialValues.current )
            , ...( newFormValues && {
                values: deepMerge( values, newFormValues )
            } )
        } );
    } );

    const submitOrResetHelpers: SubmissionOrResetHelpers<TFormValues> = {
        setFieldValue
        , setValues
        , setFieldError
        , setErrors
        , setFieldTouched
        , setTouched
        , resetForm
    };

    const submitForm = async () => {
        formStore.set( {
            isSubmitting: true
            , isValidating: !!validateOnSubmit
        } );

        if ( validateOnSubmit ) {
            const validationErrors = await _validate( values, { updateStore: false } );
            const hasErrors = objectKeys( validationErrors ).length > 0;

            if ( hasErrors ) {
                const newTouched = touchAllFields( validationErrors );

                return formStore.set( {
                    submitCount: currentStore.submitCount + 1
                    , isSubmitting: false
                    , isValidating: false
                    , touched: newTouched
                    , errors: {
                        ...errors
                        , ...validationErrors
                    } as FormErrors<TFormValues>
                } );
            }

            formStore.set( { isValidating: false } );
        }

        await submitHandler?.( values, submitOrResetHelpers );

        formStore.set( {
            submitCount: currentStore.submitCount + 1
            , isSubmitting: false
        } );
    };

    const handleSubmit = useEventCallback( async ( e: FormEvent<HTMLFormElement> ) => {
        e.persist();
        e.preventDefault();

        /*
            Warn if form submission is triggered by a <button> without a
            specified 'type' attribute during development. Any button placed
            inside of a <form> without a type will default to type 'submit', thus
            submitting the form "accidentally" whenever clicked. A type of 'button'
            must be added to avoid this.
        */
        if ( typeof document !== 'undefined' ) {
            const activeElement = getActiveElement();

            if (
                activeElement !== null
                && activeElement instanceof HTMLButtonElement
                && !activeElement.type
            ) {
                logDevWarning(
                    'You submitted a Formularity form using a button without a \'type\' attribute. '
                    + 'Most browsers default button elements to \'type="submit"\'. '
                    + 'If this is not a submit button, please add \'type="button".'
                );
            }
        }

        submitForm();
    } );

    const handleReset = useEventCallback( async ( e: FormEvent<HTMLFormElement> ) => {
        e.preventDefault();
        e.stopPropagation();

        if ( onReset ) {
            await onReset( values, submitOrResetHelpers );
        }

        resetForm();
    } );

    const initialValuesToCompare = !isEmpty( valuesInitializer )
        ? prevValuesInitializer.current
        : initialValues.current;

    const isDirty = !isEqual( values, initialValuesToCompare );
    const isPristine = !isDirty;
    const dirtyFields = getKeysWithDiffs( values, initialValuesToCompare );

    const isValid = deepObjectKeys( errors ).length === 0;

    const isFormTouched = deepObjectKeys( touched ).length > 0;
    const areAllFieldsTouched = hasSameNestedKeys( values, touched );

    const formularityComponents = {
        Field
        , FieldList
        , SubmitButton
        , ResetButton
    };

    return {
        ...currentStore
        , values
        , errors
        , touched
        , initialValues: initialValues.current
        , registerField
        , unregisterField
        , setFieldValue
        , setValues
        , setFieldError
        , setErrors
        , setFieldTouched
        , setTouched
        , handleChange
        , handleBlur
        , submitForm
        , handleSubmit
        , resetForm
        , handleReset
        , validateForm
        , validateField
        , isDirty
        , isPristine
        , isValid
        , isEditing
        , dirtyFields
        , isFormTouched
        , areAllFieldsTouched
        , ...formularityComponents
    };
};
