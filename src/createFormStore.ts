// Types
import {
    FormStore
    , FormStoreState
    , FormValues
} from './types';

export const createFormStore = <TFormValues extends FormValues>( initialValues: TFormValues ): FormStore<TFormValues> => {
    let storeState = getDefaultFormStoreState( initialValues );

    const subscribers = new Set<() => void>();

    return {
        get: () => storeState
        , set: ( newStoreState: Partial<FormStoreState<TFormValues>> ) => {
            storeState = {
                ...storeState
                , ...newStoreState
            };

            subscribers.forEach( callback => callback() );
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
        , initialValues
        , errors: {}
        , touched: {}
        , isSubmitting: false
        , isValidating: false
        , submitCount: 0
        , isEditing: false
    };

    return defaultStoreState;
};
