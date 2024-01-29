import {
    ChangeEvent
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
    , FormValues
} from './types/types';
import { useEventCallback } from './useEventCallback';
import {
    getCheckboxValue
    , getMultiSelectValues
    , getViaPath
    , objectEntries
} from './utils';
import { isEqual } from 'lodash';

type UseFormularityParams<TFormValues extends FormValues> = {
    formStore: FormStore<TFormValues>;
    onSubmit?: ( formValues: TFormValues ) => void | Promise<void>;
};

export const useFormularity = <TFormValues extends FormValues>( {
    formStore
    , onSubmit
}: UseFormularityParams<TFormValues> ) => {
    const store = useMemo( () => formStore, [] );
    const currentStore = useSyncExternalStore<FormStoreState<TFormValues>>( store.subscribe, store.get );

    const initialValues = useRef( currentStore.values );
    const values = currentStore.values;
    const errors = currentStore.errors;

    const setFieldValue = useEventCallback( ( fieldName: keyof TFormValues, newValue: TFormValues[keyof TFormValues] ) => {
        store.set( {
            ...currentStore
            , values: {
                ...values
                , [ fieldName ]: newValue
            }
        } );
    } );

    const setValues = useCallback( ( newValues: TFormValues ) => {
        store.set( {
            ...currentStore
            , values: newValues
        } );
    }, [] );

    const setFieldError = useCallback( ( fieldName: keyof TFormValues, newError: string ) => {
        store.set( {
            ...currentStore
            , errors: {
                ...errors
                , [ fieldName ]: newError
            } as FormErrors<TFormValues>
        } );
    }, [] );

    const setErrors = useCallback( ( newErrors: FormErrors<TFormValues> ) => {
        store.set( {
            ...currentStore
            , errors: newErrors
        } );
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

        // determine field type -> number, range, checkbox, multiselect or stock input
        switch ( true ) {
            case /number|range/.test( type ): {
                const parsedValue = parseFloat( value );

                if ( isNaN( parseFloat( value ) ) ) {
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

        console.log( finalValue );

        setFieldValue( fieldName as keyof TFormValues, finalValue as TFormValues[keyof TFormValues] );
    } );

    const handleSubmit = useEventCallback( async ( e: FormEvent<HTMLFormElement> ) => {
        e.persist();
        e.preventDefault();

        store.set( {
            ...currentStore
            , isSubmitting: true
        } );

        await onSubmit?.( currentStore.values );

        store.set( {
            ...currentStore
            , submitCount: currentStore.submitCount + 1
            , isSubmitting: false
        } );

    } );

    const isDirty = !isEqual( currentStore.values, initialValues.current );

    const dirtyFields = values
        && objectEntries( values )
            .filter( ( [ field, value ] ) => value !== initialValues.current?.[ field ] )
            .flatMap( ( [ field ] ) => field );

    return {
        ...currentStore
        , initialValues: initialValues.current
        , setFieldValue
        , setValues
        , setFieldError
        , setErrors
        , handleChange
        , handleSubmit
        , isDirty
        , dirtyFields
    };
};
