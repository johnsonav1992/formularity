import { useSyncExternalStore } from 'react';

// Types
import {
    FormStore
    , FormStoreState
    , FormValues
} from './types';

/**
 * Hook that subscribes to a specific slice of the form store using a selector.
 * This allows components to only rerender when the specific data they care about changes.
 */
export const useFormStoreSubscription = <
    TFormValues extends FormValues
    , TSelected = FormStoreState<TFormValues>
>(
    formStore: FormStore<TFormValues>
    , selector: ( state: FormStoreState<TFormValues> ) => TSelected
): TSelected => {
    return useSyncExternalStore(
        formStore.subscribe
        , () => selector( formStore.get() )
        , () => selector( formStore.get() )
    );
};
