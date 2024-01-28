import {
    ChangeEvent
    , FormEvent
    , useCallback
    , useMemo
    , useSyncExternalStore
} from 'react';
import {
    FormErrors
    , FormStore
    , FormValues
} from './types/types';
import { useEventCallback } from './useEventCallback';
import {
    getCheckboxValue
    , getMultiSelectValues
    , getViaPath
} from './utils';

type UseFormularityParams<TFormValues extends FormValues> = {
    formStore: FormStore<TFormValues>;
    onSubmit?: ( formValues: TFormValues ) => void | Promise<void>;
};

export const useFormularity = <TFormValues extends FormValues>( {
    formStore
    , onSubmit
}: UseFormularityParams<TFormValues> ) => {
    const store = useMemo( () => formStore, [] );
    const currentStore = useSyncExternalStore( store.subscribe, store.get );

    const errors = currentStore.errors;
    const values = currentStore.values;

    const setFieldValue = useCallback( ( fieldName: keyof TFormValues, newValue: TFormValues[keyof TFormValues] ) => {
        store.set( {
            ...currentStore
            , values: {
                ...values
                , [ fieldName ]: newValue
            }
        } );
    }, [] );

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
        let parsedValue: number;

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

        // determine field type -> number, checkbox, multiselect or stock
        switch ( true ) {
            case /number|range/.test( type ): {
                parsedValue = parseFloat( value );

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

    return {
        ...currentStore
        , setFieldValue
        , setValues
        , setFieldError
        , setErrors
        , handleChange
        , handleSubmit
    };
};
