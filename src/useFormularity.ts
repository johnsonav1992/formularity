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
    FormErrors
    , FormStore
    , FormStoreState
    , FormTouched
    , FormValues
    , FormularityProps
    , ValidationHandler
} from './types';

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
} from './utils';
import { getDefaultFormStoreState } from './createFormStore';
import {
    DeepKeys
    , DeepValue
} from './utilityTypes';

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
     * A function that takes the current form values and returns a manually
     * populated errors object / or a schema generated by a validation plugin.
     */
    manualValidationHandler?: ValidationHandler<TFormValues>;
    /**
     * A custom input for a validation schema from a third-party library
     * Must be wrapped in a provided or a custom-built adapter
     */
    validationSchema?: ValidationHandler<TFormValues>;
    /**
     * Submit handler for the form. This is called when the form is submitted.
     */
    onSubmit?: ( formValues: TFormValues ) => void | Promise<void>;
};

export const useFormularity = <TFormValues extends FormValues>( {
    formStore
    , isEditing = false
    , manualValidationHandler
    , validationSchema
    , onSubmit
}: UseFormularityParams<TFormValues> ): FormularityProps<TFormValues> => {
    const store = formStore;
    const currentStore = useSyncExternalStore<FormStoreState<TFormValues>>( store.subscribe, store.get );

    const initialValues = useRef( currentStore.initialValues );
    const values = currentStore.values;
    const errors = currentStore.errors;
    const touched = currentStore.touched;
    const isMounted = useRef<boolean>( false );

    useEffect( () => {
        isMounted.current = true;

        return () => {
            isMounted.current = false;
        };
    }, [] );

    const validateForm = useEventCallback( async ( values: TFormValues ) => {
        let errors: Partial<FormErrors<TFormValues>> = {};

        if ( validationSchema ) {
            const validationSchemaErrors = await validationSchema( values );
            if ( validationSchemaErrors ) {
                errors = validationSchemaErrors;
            }
        } else {
            errors = runUserDefinedValidations( values ) as Partial<FormErrors<TFormValues>>;
        }

        setErrors( errors as FormErrors<TFormValues> );

        return errors;
    } );

    const runUserDefinedValidations = useEventCallback( ( values: TFormValues ) => {
        if ( manualValidationHandler ) {
            const validationErrors = manualValidationHandler( values );

            if ( isEmpty( validationErrors ) ) {
                return setErrors( {} );
            } else {
                setErrors( validationErrors as FormErrors<TFormValues> );
            }

            return validationErrors;
        }
    } );

    const setFieldValue = useEventCallback( ( fieldName: DeepKeys<TFormValues>, newValue: TFormValues[keyof TFormValues] ) => {
        const newValues = setViaPath( values, fieldName, newValue );

        store.set( { values: newValues } );

        validateForm( newValues );
    } );

    const setValues = useCallback( ( newValues: TFormValues ) => {
        store.set( { values: newValues } );
    }, [] );

    const setFieldError = useCallback( ( fieldName: DeepKeys<TFormValues>, newError: string ) => {
        store.set( {
            errors: {
                ...errors
                , [ fieldName ]: newError
            } as FormErrors<TFormValues>
        } );
    }, [] );

    const setErrors = useCallback( ( newErrors: FormErrors<TFormValues> ) => {
        store.set( { errors: newErrors } );
    }, [] );

    const setFieldTouched = useEventCallback( ( fieldName: DeepKeys<TFormValues>, newTouched: boolean ) => {
        store.set( {
            touched: {
                ...touched
                , [ fieldName ]: newTouched
            } as FormTouched<TFormValues>
        } );

        validateForm( values );
    } );

    const setTouched = useCallback( ( newTouched: FormTouched<TFormValues> ) => {
        store.set( { touched: newTouched } );
    }, [] );

    const handleChange = useEventCallback( ( e: ChangeEvent<HTMLInputElement | HTMLSelectElement> ) => {
        // e.persist();

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
            case /checkbox/.test( type ):
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
            , finalValue as DeepValue<TFormValues, DeepKeys<TFormValues>>
        );
    } );

    const handleBlur = useEventCallback( ( e: FocusEvent<HTMLInputElement | HTMLSelectElement> ) => {
        const { name: fieldName } = e.target;

        setFieldTouched( fieldName as DeepKeys<TFormValues>, true );
    } );

    const handleSubmit = useEventCallback( async ( e: FormEvent<HTMLFormElement> ) => {
        e.persist();
        e.preventDefault();

        store.set( {
            isSubmitting: true
            , isValidating: true
        } );

        const validationErrors = await validateForm( values );
        const hasErrors = objectKeys( validationErrors ).length > 0;

        if ( hasErrors ) {
            store.set( {
                submitCount: currentStore.submitCount + 1
                , isSubmitting: false
                , isValidating: false
            } );

            return setErrors( {
                ...errors
                , ...validationErrors
            } as FormErrors<TFormValues> );
        }

        store.set( { isValidating: false } );

        await onSubmit?.( currentStore.values );

        store.set( {
            submitCount: currentStore.submitCount + 1
            , isSubmitting: false
        } );

    } );

    const resetForm = ( newFormValues?: Partial<TFormValues> ) => {
        store.set( {
            ...getDefaultFormStoreState( initialValues.current )
            , ...( newFormValues && {
                values: {
                    ...values
                    , ...newFormValues
                }
            } )
        } as FormStoreState<TFormValues> );
    };

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
        , setFieldValue
        , setValues
        , setFieldError
        , setErrors
        , setFieldTouched
        , setTouched
        , handleChange
        , handleBlur
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
