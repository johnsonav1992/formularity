import {
    useCallback
    , useMemo
    , useSyncExternalStore
} from 'react';
import {
    FormErrors
    , FormStore
    , FormValues
} from './types/types';

type UseFormularityParams<TFormValues extends FormValues> = {
    formStore: FormStore<TFormValues>;
    onSubmit: ( formValues: TFormValues ) => void | Promise<void>;
};

export const useFormularity = <TFormValues extends FormValues>( {
    formStore
    , onSubmit
}: UseFormularityParams<TFormValues> ) => {
    const memoizedStore = useMemo( () => formStore, [] );
    const store = useSyncExternalStore( memoizedStore.subscribe, memoizedStore.get );

    const errors = store.errors;
    const values = store.values;

    const setFieldValue = useCallback( ( fieldName: keyof TFormValues, newValue: TFormValues[keyof TFormValues] ) => {
        memoizedStore.set( {
            errors
            , values: {
                ...values
                , [ fieldName ]: newValue
            }
        } );
    }, [] );

    const setValues = useCallback( ( newValues: TFormValues ) => {
        memoizedStore.set( {
            errors
            , values: newValues
        } );
    }, [] );

    const setFieldError = useCallback( ( fieldName: keyof TFormValues, newError: string ) => {
        memoizedStore.set( {
            values
            , errors: {
                ...errors
                , [ fieldName ]: newError
            } as FormErrors<TFormValues>
        } );
    }, [] );

    return {
        values
        , errors
        , setFieldValue
        , setValues
        , setFieldError
    };
};
