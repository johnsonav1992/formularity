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
} from './types';
import {
    CheckboxValue
    , DeepKeys
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
} from './utils';
import { getDefaultFormStoreState } from './createFormStore';

export type UseFormularityParams<TFormValues extends FormValues> = {
    /**
     * Formularity store used to power the form
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
     * Note: Be cautious as to how you pass this new values object as it can
     * override desired values if your logic is not set up properly.
     *
     */
    valuesInitializer?: NoInfer<TFormValues>;
    /**
     * Submit handler for the form. This is called when the form is submitted.
     */
    onSubmit?: ( formValues: TFormValues ) => void | Promise<void>;
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

export const useFormularity = <TFormValues extends FormValues>( {
    formStore
    , isEditing = false
    , valuesInitializer
    , onSubmit
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
            formStore.set( { values: valuesInitializer } );

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

            fieldRegistry.current[ name ] = { ...fieldRegistryProps } as never;
        }
        , []
    );

    const unregisterField = useCallback(
        <TFieldName extends DeepKeys<TFormValues>>( fieldName: TFieldName ) => {
            delete fieldRegistry.current[ fieldName ];
        }
        , []
    );

    const validateForm = useEventCallback( async ( values: TFormValues ) => {
        let newErrors: Partial<FormErrors<TFormValues>> = {};
        const hasSingleFieldValidators = Object.values( fieldRegistry.current ).some( Boolean );
        const singleValidatorKeys = hasSingleFieldValidators
            ? objectEntries( fieldRegistry.current )
                .filter( ( [ _, registration ] ) => !!registration?.validationHandler )
                .map( ( [ key ] ) => key )
            : [];

        const validationRunner = async ( validationHandlerToRun: ValidationHandler<TFormValues> ) => {
            const validationErrors = await validationHandlerToRun( values );

            if ( validationErrors ) {
                newErrors = validationErrors;
            }

            if ( hasSingleFieldValidators ) {
                for ( const error in newErrors ) {
                    if ( singleValidatorKeys.includes( error as never ) ) {
                        delete newErrors[ error as keyof Partial<FormErrors<TFormValues>> ];
                    }
                }

                newErrors = await runAllSingleFieldValidators( newErrors );
            }

            // If the errors haven't changed, skip render cycle and just return the errors
            if ( isEqual( newErrors, errors ) ) return newErrors;

            setErrors( newErrors );
            return newErrors;
        };

        switch ( true ) {
            case !!validationSchema: validationRunner( validationSchema );
                break;
            case !!manualValidationHandler: validationRunner( runUserDefinedValidations as ValidationHandler<TFormValues> );
                break;
            default: {
                newErrors = await runAllSingleFieldValidators( newErrors );
                setErrors( newErrors as FormErrors<TFormValues> );
            }
        }

        return newErrors;
    } );

    const runUserDefinedValidations = useEventCallback( async ( values: TFormValues ) => {
        const validationErrors = await manualValidationHandler?.( values );

        if ( isEmpty( validationErrors ) ) {
            return setErrors( {} );
        } else {
            setErrors( validationErrors as FormErrors<TFormValues> );
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

    const runAllSingleFieldValidators = useEventCallback( async ( errors: Partial<FormErrors<TFormValues>> ) => {
        for ( const [ fieldName, registration ] of objectEntries( fieldRegistry.current ) ) {
            const fieldErrorOrNull = registration?.validationHandler
                ? await runSingleFieldValidation( registration?.validationHandler, fieldName )
                : null;

            if ( fieldErrorOrNull ) {
                errors = setViaPath(
                    errors,
                    fieldName as DeepKeys<Partial<FormErrors<TFormValues>>>
                    , fieldErrorOrNull
                );
            }
        }

        return errors;
    } );

    const setFieldValue = useEventCallback( ( fieldName: DeepKeys<TFormValues>, newValue: TFormValues[keyof TFormValues] ) => {
        const newValues = setViaPath( values, fieldName, newValue );

        formStore.set( { values: newValues } );

        validateOnChange && validateForm( newValues );
    } );

    const setValues = useCallback( ( newValues: TFormValues ) => {
        formStore.set( { values: newValues } );

        validateOnChange && validateForm( newValues );
    }, [] );

    const setFieldError = useCallback( ( fieldName: DeepKeys<TFormValues>, newError: string ) => {
        const newFieldErrors = setViaPath(
            errors
            , fieldName as DeepKeys<FormErrors<TFormValues>>
            , newError
        );

        formStore.set( { errors: newFieldErrors } );
    }, [] );

    const setErrors = useCallback( ( newErrors: FormErrors<TFormValues> ) => {
        formStore.set( { errors: newErrors } );
    }, [] );

    const setFieldTouched = useEventCallback( ( fieldName: DeepKeys<TFormValues>, newTouched: boolean ) => {
        const newFieldTouched = setViaPath(
            touched
            , fieldName as DeepKeys<FormTouched<TFormValues>>
            , newTouched
        );

        // TODO: Need to find a create way to cut down on a render here
        // (Try to get touched and validations to update in one render)

        formStore.set( { touched: newFieldTouched } );
        validateOnBlur && validateForm( values );
    } );

    const setTouched = useCallback( ( newTouched: FormTouched<TFormValues> ) => {
        if ( isEqual( touched, newTouched ) ) return;

        validateOnBlur && formStore.set( { touched: newTouched } );
    }, [] );

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
            , finalValue as TFormValues[keyof TFormValues]
        );
    } );

    const handleBlur = useEventCallback( ( e: FocusEvent<HTMLInputElement | HTMLSelectElement> ) => {
        const fieldName = e.target.name as DeepKeys<TFormValues>;

        setFieldTouched( fieldName, true );
    } );

    const submitForm = async () => {
        formStore.set( {
            isSubmitting: true
            , isValidating: !!validateOnSubmit
        } );

        if ( validateOnSubmit ) {
            const validationErrors = await validateForm( values );
            const hasErrors = objectKeys( validationErrors ).length > 0;

            if ( hasErrors ) {
                const newTouched = objectKeys( validationErrors )
                    .reduce<FormTouched<TFormValues>>( ( errorsObj, key ) => {
                        errorsObj[ key ] = true as never;

                        return errorsObj;
                    }, {} as never );

                return formStore.set( {
                    submitCount: currentStore.submitCount + 1
                    , isSubmitting: false
                    , isValidating: false
                    , touched: newTouched as FormTouched<TFormValues>
                    , errors: {
                        ...errors
                        , ...validationErrors
                    } as FormErrors<TFormValues>
                } );
            }

            formStore.set( { isValidating: false } );
        }

        await submitHandler?.( currentStore.values );

        formStore.set( {
            submitCount: currentStore.submitCount + 1
            , isSubmitting: false
        } );
    };

    const handleSubmit = useEventCallback( async ( e: FormEvent<HTMLFormElement> ) => {
        e.persist();
        e.preventDefault();

        submitForm();
    } );

    const resetForm = useEventCallback( ( newFormValues?: Partial<TFormValues> ) => {
        formStore.set( {
            ...getDefaultFormStoreState( initialValues.current )
            , ...( newFormValues && {
                values: {
                    ...values
                    , ...newFormValues
                }
            } )
        } as FormStoreState<TFormValues> );
    } );

    const handleReset = useEventCallback( ( e: FormEvent<HTMLFormElement> ) => {
        e.preventDefault();
        e.stopPropagation();

        resetForm();
    } );

    const isDirty = !isEqual( values, initialValues.current );
    const dirtyFields = getKeysWithDiffs( values, initialValues.current );

    const isValid = deepObjectKeys( errors ).length === 0;

    const isFormTouched = deepObjectKeys( touched ).length > 0;
    const areAllFieldsTouched = hasSameNestedKeys( values, touched );

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
        , isDirty
        , isValid
        , isEditing
        , dirtyFields
        , isFormTouched
        , areAllFieldsTouched
    };
};
