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
} from './types';
import {
    DeepKeys
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
};

export const useFormularity = <TFormValues extends FormValues>( {
    formStore
    , isEditing = false
    , valuesInitializer
    , onSubmit
    , validateOnBlur = true
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
                , validationHandler
            } = newFieldRegistration;

            if ( fieldRegistry.current[ name ] ) return;

            fieldRegistry.current[ name ] = validationHandler as never;
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
        let errors: Partial<FormErrors<TFormValues>> = {};
        const hasSingleFieldValidators = Object.values( fieldRegistry.current ).some( Boolean );

        if ( validationSchema ) {
            const validationSchemaErrors = await validationSchema( values );
            if ( validationSchemaErrors ) {
                errors = validationSchemaErrors;

                if ( hasSingleFieldValidators ) {
                    errors = await runAllSingleFieldValidators( errors );
                }

                setErrors( errors as FormErrors<TFormValues> );
            }
        } else if ( manualValidationHandler ) {
            errors = await runUserDefinedValidations( values ) as Partial<FormErrors<TFormValues>>;

            if ( hasSingleFieldValidators ) {
                errors = await runAllSingleFieldValidators( errors );
            }

            setErrors( errors as FormErrors<TFormValues> );
        } else {
            if ( hasSingleFieldValidators ) {
                errors = await runAllSingleFieldValidators( errors );
                setErrors( errors as FormErrors<TFormValues> );
            }
        }

        return errors;
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
        for ( const [ fieldName, fieldValidator ] of objectEntries( fieldRegistry.current ) ) {
            const fieldErrorOrNull = fieldValidator
                ? await runSingleFieldValidation( fieldValidator as never, fieldName )
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

        validateForm( newValues );
    } );

    const setValues = useCallback( ( newValues: TFormValues ) => {
        formStore.set( { values: newValues } );
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

        formStore.set( { touched: newFieldTouched } );

        validateOnBlur && validateForm( values );
    } );

    const setTouched = useCallback( ( newTouched: FormTouched<TFormValues> ) => {
        formStore.set( { touched: newTouched } );
    }, [] );

    const handleChange = useEventCallback( ( e: ChangeEvent<HTMLInputElement | HTMLSelectElement> ) => {
        let finalValue;

        const {
            value
            , name: fieldName
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
                    getViaPath( values, fieldName as DeepKeys<TFormValues> ) as Parameters<typeof getCheckboxValue>[0]
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
            fieldName as DeepKeys<TFormValues>
            , finalValue as TFormValues[keyof TFormValues]
        );
    } );

    const handleBlur = useEventCallback( ( e: FocusEvent<HTMLInputElement | HTMLSelectElement> ) => {
        const { name: fieldName } = e.target;

        setFieldTouched( fieldName as DeepKeys<TFormValues>, true );
    } );

    const submitForm = async () => {
        formStore.set( {
            isSubmitting: true
            , isValidating: true
        } );

        const validationErrors = await validateForm( values );
        const hasErrors = objectKeys( validationErrors ).length > 0;

        if ( hasErrors ) {
            formStore.set( {
                submitCount: currentStore.submitCount + 1
                , isSubmitting: false
                , isValidating: false
            } );

            return setErrors( {
                ...errors
                , ...validationErrors
            } as FormErrors<TFormValues> );
        }

        formStore.set( { isValidating: false } );

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

    const dirtyFields = values
        && objectEntries( values )
            .filter( ( [ field, value ] ) => value !== initialValues.current?.[ field ] )
            .flatMap( ( [ field ] ) => field );

    const isValid = objectKeys( errors ).length === 0;

    const isFormTouched = objectKeys( touched ).length > 0;

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
    };
};
