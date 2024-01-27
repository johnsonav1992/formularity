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
