import {
    ChangeEvent
    , FocusEvent
    , FormEvent
    , useCallback
    , useMemo
    , useRef
    , useSyncExternalStore
} from 'react';
import {
    FormErrors
    , FormStore
    , FormStoreState
    , FormTouched
    , FormValues
    , UseFormularityReturn
} from './types/types';
import { useEventCallback } from './useEventCallback';
import {
    getCheckboxValue
    , getMultiSelectValues
    , getViaPath
    , objectEntries
    , objectKeys
} from './utils';
import isEqual from 'lodash/isEqual';

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
     * Submit handler for the form. This is called when the form is submitted.
     */
    onSubmit?: ( formValues: TFormValues ) => void | Promise<void>;
};

export const useFormularity = <TFormValues extends FormValues>( {
    formStore
    , isEditing = false
    , onSubmit
}: UseFormularityParams<TFormValues> ): UseFormularityReturn<TFormValues> => {
    const store = useMemo( () => formStore, [] );
    const currentStore = useSyncExternalStore<FormStoreState<TFormValues>>( store.subscribe, store.get );

    const initialValues = useRef( currentStore.initialValues );
    const values = currentStore.values;
    const errors = currentStore.errors;
    const touched = currentStore.touched;

    const setFieldValue = useEventCallback( ( fieldName: keyof TFormValues, newValue: TFormValues[keyof TFormValues] ) => {
        store.set( {
            values: {
                ...values
                , [ fieldName ]: newValue
            }
        } );
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

        await onSubmit?.( currentStore.values );

        store.set( {
            submitCount: currentStore.submitCount + 1
            , isSubmitting: false
        } );

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
        , isDirty
        , isValid
        , isEditing
        , dirtyFields
        , isFormTouched
    };
};
