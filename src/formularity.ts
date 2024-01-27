import {
    useMemo
    , useSyncExternalStore
} from 'react';
import {
    FormStore
    , FormValues
} from './types/types';

export const createFormStore = <TFormValues extends FormValues>( initialValues: TFormValues ): FormStore<TFormValues> => {
    const valuesStore = initialValues;
    const errorsStore = {};

    let combinedStore = {
        values: valuesStore
        , errors: errorsStore
    };

    const subscribers = new Set<( store: typeof combinedStore ) => void>();

    return {
        get: () => combinedStore
        , set: ( newStoreState: typeof combinedStore ) => {
            combinedStore = newStoreState;

            subscribers.forEach( callback => callback( combinedStore ) );
        }
        , subscribe: callback => {
            subscribers.add( callback );

            return () => {
                subscribers.delete( callback );
            };
        }
    };
};

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

    const setFieldValue = ( fieldName: keyof TFormValues, newValue: TFormValues[keyof TFormValues] ) => {
        formStore.set( {
            errors
            , values: {
                ...values
                , [ fieldName ]: newValue
            }
        } );
    };

    return {
        values: store.values
        , errors: store.errors
        , setFieldValue
    };
};
