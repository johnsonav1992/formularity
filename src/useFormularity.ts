import {
    ChangeEvent
    , FocusEvent
    , FormEvent
    , useCallback
    , useEffect
    , useMemo
    , useRef
    , useSyncExternalStore
} from 'react';

// Libraries
import isEqual from 'lodash/isEqual';
import isEmpty from 'lodash/isEmpty';

// Types
import {
    FormErrors
    , FormStore
    , FormStoreState
    , FormTouched
    , FormValues
    , ManualValidationHandler
    , UseFormularityReturn
} from './types/types';

// Hooks
import { useEventCallback } from './useEventCallback';

// Utils
import {
    getCheckboxValue
    , getMultiSelectValues
    , getViaPath
    , objectEntries
    , objectKeys
} from './utils';

type UseFormularityParams<TFormValues extends FormValues> = {
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
    manualValidationHandler?: ManualValidationHandler<TFormValues>;
    /**
     * Submit handler for the form. This is called when the form is submitted.
     */
    onSubmit?: ( formValues: TFormValues ) => void | Promise<void>;
};

export const useFormularity = <TFormValues extends FormValues>( {
    formStore
    , isEditing = false
    , manualValidationHandler
    , onSubmit
}: UseFormularityParams<TFormValues> ): UseFormularityReturn<TFormValues> => {
    const store = useMemo( () => formStore, [] );
    const currentStore = useSyncExternalStore<FormStoreState<TFormValues>>( store.subscribe, store.get );

    const initialValues = useRef( currentStore.initialValues );
    const values = currentStore.values;
    const errors = currentStore.errors;
    const touched = currentStore.touched;
    const isMounted = currentStore.isFormMounted;

    useEffect( () => {
        store.set( { isFormMounted: true } );

        return () => {
            store.set( { isFormMounted: false } );
        };
    }, [] );

    const validateForm = useCallback( () => {
        const validationErrors = runUserDefinedValidations();
        return validationErrors;
    }, [] );

    const runUserDefinedValidations = useCallback( () => {
        if ( manualValidationHandler ) {
            const validationErrors = manualValidationHandler( values );

            if ( isEmpty( validationErrors ) ) {
                return setErrors( {} );
            } else {
                setErrors( {
                    ...errors
                    , ...validationErrors
                } as FormErrors<TFormValues> );
            }

            return validationErrors;
        }
    }, [] );

    const setFieldValue = useEventCallback( ( fieldName: keyof TFormValues, newValue: TFormValues[keyof TFormValues] ) => {
        store.set( {
            values: {
                ...values
                , [ fieldName ]: newValue
            }
        } );

        validateForm();
    } );

    const setValues = useCallback( ( newValues: TFormValues ) => {
        store.set( { values: newValues } );
    }, [] );

    const setFieldError = useCallback( ( fieldName: keyof TFormValues, newError: string ) => {
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

    const setFieldTouched = useEventCallback( ( fieldName: keyof TFormValues, newTouched: boolean ) => {
        store.set( {
            touched: {
                ...touched
                , [ fieldName ]: newTouched
            } as FormTouched<TFormValues>
        } );

        validateForm();
    } );

    const setTouched = useCallback( ( newTouched: FormTouched<TFormValues> ) => {
        store.set( { touched: newTouched } );
    }, [] );

    const handleChange = useEventCallback( ( e: ChangeEvent<HTMLInputElement | HTMLSelectElement> ) => {
        e.persist();

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
                    getViaPath( values, fieldName ) as Parameters<typeof getCheckboxValue>[0]
                    , checked
                    , value
                );
                break;
            case options && multiple:
                finalValue = getMultiSelectValues( options );
                break;
            default: finalValue = value;
        }

        setFieldValue( fieldName as keyof TFormValues, finalValue as TFormValues[keyof TFormValues] );

        // TODO: update once validation is ready
    } );

    const handleBlur = useEventCallback( ( e: FocusEvent<HTMLInputElement | HTMLSelectElement> ) => {
        const { name: fieldName } = e.target;

        setFieldTouched( fieldName as keyof TFormValues, true );

        // TODO: update once validation is ready
    } );

    const handleSubmit = useEventCallback( async ( e: FormEvent<HTMLFormElement> ) => {
        e.persist();
        e.preventDefault();

        store.set( { isSubmitting: true } );

        const validationErrors = validateForm();

        if ( validationErrors ) {
            store.set( {
                submitCount: currentStore.submitCount + 1
                , isSubmitting: false
            } );

            return setErrors( {
                ...errors
                , ...validationErrors
            } as FormErrors<TFormValues> );
        }

        await onSubmit?.( currentStore.values );

        store.set( {
            submitCount: currentStore.submitCount + 1
            , isSubmitting: false
        } );

    } );

    const resetForm = ( newFormValues?: Partial<TFormValues> ) => {
        store.set( {
            errors: {}
            , touched: {}
            , values: {
                ...values
                , ...newFormValues
            }
        } );
    };

    const isDirty = !isEqual( values, initialValues.current );

    const dirtyFields = values
        && objectEntries( values )
            .filter( ( [ field, value ] ) => value !== initialValues.current?.[ field ] )
            .flatMap( ( [ field ] ) => field );

    const isValid = objectKeys( errors ).length === 0;

    const isFormTouched = objectKeys( touched ).length > 0;

    return {
        ...currentStore
        , isFormMounted: isMounted
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
        , isDirty
        , isValid
        , isEditing
        , dirtyFields
        , isFormTouched
    };
};
