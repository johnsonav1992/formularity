import { useSyncExternalStore, useRef, useEffect } from 'react';

// Types
import {
    FormStore
    , FormStoreState
    , FormValues
} from './types';

// Utils
import { isEqual } from './generalUtils';

/**
 * Hook that subscribes to a specific slice of the form store using a selector.
 * This allows components to only rerender when the specific data they care about changes.
 * Uses deep equality checking to prevent unnecessary rerenders when selected values haven't changed.
 */
export const useFormStoreSubscription = <
    TFormValues extends FormValues
    , TSelected = FormStoreState<TFormValues>
>(
        formStore: FormStore<TFormValues>
        , selector: ( state: FormStoreState<TFormValues> ) => TSelected
    ): TSelected => {
    // Keep track of the previous value to do deep equality checking
    const prevValueRef = useRef<TSelected>();
    const selectorRef = useRef( selector );

    // Update selector ref on each render to always use the latest selector
    useEffect( () => {
        selectorRef.current = selector;
    } );

    // Custom getSnapshot that does deep equality checking
    const getSnapshot = () => {
        const nextValue = selectorRef.current( formStore.get() );
        
        // If values are deeply equal, return the previous reference to prevent rerender
        if ( prevValueRef.current !== undefined && isEqual( prevValueRef.current, nextValue ) ) {
            return prevValueRef.current;
        }
        
        prevValueRef.current = nextValue;
        return nextValue;
    };

    return useSyncExternalStore(
        formStore.subscribe
        , getSnapshot
        , getSnapshot
    );
};
