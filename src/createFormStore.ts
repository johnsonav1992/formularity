import {
    FormStore
    , FormStoreState
    , FormValues
} from './types/types';

export const createFormStore = <TFormValues extends FormValues>( initialValues: TFormValues ): FormStore<TFormValues> => {
    let storeState = getDefaultFormStoreState( initialValues );

    const subscribers = new Set<( store: typeof storeState ) => void>();

    return {
        get: () => storeState
        , set: ( newStoreState: typeof storeState ) => {
            storeState = {
                ...storeState
                , ...newStoreState
            };

            subscribers.forEach( callback => callback( storeState ) );
        }
        , subscribe: callback => {
            subscribers.add( callback );

            return () => {
                subscribers.delete( callback );
            };
        }
    };
};

export const getDefaultFormStoreState = <TFormValues extends FormValues>( initialValues: TFormValues ) => {
    const defaultStoreState: FormStoreState<TFormValues> = {
        values: initialValues
        , errors: {}
        , touched: {}
        , isSubmitting: false
        , dirty: false
        , isValid: false
        , isValidating: false
        , submitCount: 0
    };

    return defaultStoreState;
};
