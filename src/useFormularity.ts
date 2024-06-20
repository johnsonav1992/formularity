import {
    ChangeEvent
    , FocusEvent
    , FormEvent
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
} from './types';
import {
    CheckboxValue
    , DeepKeys
    , DeepPartial
    , DeepValue
    , NoInfer
} from './utilityTypes';

// Hooks
import { useEventCallback } from './useEventCallback';

// Utils
import {
    getCheckboxValue
    , getMultiSelectValues
    , getViaPath
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
} from './utils';
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
 * the `<Formularity />` component and its child components. This form may be used to manually
 * implement a custom version of Formularity, but it is recommended to only go this route if
 * absolutely necessary. This hook may also be used to access form state from outside of the `<Formularity />`
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

    // TODO: expose version of this to user
    // TODO: expose a validateField function as well
    const _validateForm = useEventCallback( async ( values: TFormValues, options?: { updateStore?: boolean } ) => {
        const updateStore = options?.updateStore ?? true;

        let newErrors: DeepPartial<FormErrors<TFormValues>> = {};

        const singleValidatorKeys = objectEntries( fieldRegistry.current )
            .filter( ( [ _, registration ] ) => !!registration?.validationHandler )
            .map( ( [ key ] ) => key );

        const validationRunner = async ( validationHandlerToRun: ValidationHandler<TFormValues> ) => {
            const validationErrors = await validationHandlerToRun( values );

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
            case !!manualValidationHandler: await validationRunner( runUserDefinedValidations as ValidationHandler<TFormValues> );
                break;
            default: {
                newErrors = await runAllSingleFieldValidators( newErrors );
                updateStore && setErrors( newErrors );
            }
        }

        return newErrors;
    } );

    // TODO: need to rework this in light of the above validationRunner fn
    const runUserDefinedValidations = useEventCallback( async ( values: TFormValues ) => {
        const validationErrors = await manualValidationHandler?.( values );

        if ( isEmpty( validationErrors ) ) {
            return setErrors( {} );
        } else {
            setErrors( deepMerge( errors, validationErrors! ) as DeepPartial<FormErrors<TFormValues>> );
        }

        return validationErrors;
    } );

    const runSingleFieldValidation = useEventCallback( async (
        fieldValidator: SingleFieldValidator<TFormValues>
        , fieldName: DeepKeys<TFormValues>
    ) => {
        const fieldValue = getViaPath( values, fieldName );
        const fieldErrorOrNull = await fieldValidator( fieldValue as never );

        if ( fieldErrorOrNull ) return fieldErrorOrNull;

        return null;
    } );

    const runAllSingleFieldValidators = useEventCallback( async ( errors: DeepPartial<FormErrors<TFormValues>> ) => {
        for ( const [ fieldName, registration ] of objectEntries( fieldRegistry.current ) ) {
            const fieldErrorOrNull = registration?.validationHandler
                ? await runSingleFieldValidation( registration?.validationHandler, fieldName )
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

    const validateForm: FormHandlers<TFormValues>['validateForm'] = async options => {
        const shouldTouchAllFields = options?.shouldTouchAllFields ?? true;

        const validationErrors = await _validateForm( values, { updateStore: false } );

        console.log( validationErrors );

        formStore.set( {
            touched: shouldTouchAllFields ? touchAllFields() : touched
            , errors: validationErrors as FormErrors<TFormValues>
        } );

        return validationErrors as FormErrors<TFormValues>;
    };

    // TODO: add options object with validation options
    const setFieldValue: FormHandlers<TFormValues>['setFieldValue']
        = useEventCallback( ( fieldName, newValue ) => {
            const newValues = setViaPath( values, fieldName, newValue );

            formStore.set( { values: newValues } );

            validateOnChange && _validateForm( newValues );
        } );

    // TODO: add options object with validation options
    const setValues = useCallback( ( newValues: DeepPartial<TFormValues> ) => {
        const mergedValues = deepMerge( values, newValues );
        formStore.set( { values: mergedValues } );

        validateOnChange && _validateForm( mergedValues );
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

    const setFieldTouched = useEventCallback( ( fieldName: DeepKeys<TFormValues>, newTouched: boolean ) => {
        const newFieldTouched = setViaPath(
            touched
            , fieldName as DeepKeys<FormTouched<TFormValues>>
            , newTouched
        );

        // TODO: Need to find a creative way to cut down on a render here
        // (Try to get touched and validations to update in one render)

        formStore.set( { touched: newFieldTouched } );
        validateOnBlur && _validateForm( values );
    } );

    const setTouched = useCallback( ( newTouched: FormTouched<TFormValues> ) => {
        if ( isEqual( touched, newTouched ) ) return;

        validateOnBlur && formStore.set( { touched: newTouched } );
    }, [] );

    const touchAllFields = ( validationErrors?: DeepPartial<FormErrors<TFormValues>> ) => {
        const targetObj = validationErrors || values;

        console.log( targetObj );

        return deepObjectKeys( targetObj )
            .reduce<FormTouched<TFormValues>>( ( touchedObj, key ) => {
                const newTouchedObj = setViaPath( touchedObj, key as never, true );

                return newTouchedObj;
            }, {} as FormTouched<TFormValues> );
    };

    const handleChange = useEventCallback( ( e: ChangeEvent<HTMLInputElement | HTMLSelectElement> ) => {
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
            fieldName
            , finalValue as DeepValue<TFormValues, DeepKeys<TFormValues>>
        );
    } );

    const handleBlur = useEventCallback( ( e: FocusEvent<HTMLInputElement | HTMLSelectElement> ) => {
        const fieldName = e.target.name as DeepKeys<TFormValues>;

        setFieldTouched( fieldName, true );
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
            const validationErrors = await _validateForm( values );
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

        //TODO: Warn about missing button type identifier

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
