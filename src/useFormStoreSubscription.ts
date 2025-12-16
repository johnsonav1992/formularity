import { useState, useEffect, useRef } from 'react';

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
 * 
 * Implementation inspired by Zustand and Tanstack Form - uses manual subscription
 * with useState for better control over rerenders.
 */
export const useFormStoreSubscription = <
    TFormValues extends FormValues
    , TSelected = FormStoreState<TFormValues>
>(
        formStore: FormStore<TFormValues>
        , selector: ( state: FormStoreState<TFormValues> ) => TSelected
    ): TSelected => {
    const selectorRef = useRef( selector );
    selectorRef.current = selector;

    // Initialize state with the current selected value
    const [ selectedState, setSelectedState ] = useState( () => selector( formStore.get() ) );
    
    // Keep track of the last selected value for comparison
    const lastSelectedRef = useRef( selectedState );
    lastSelectedRef.current = selectedState;

    useEffect( () => {
        // Subscribe to store changes
        const unsubscribe = formStore.subscribe( () => {
            const state = formStore.get();
            const nextValue = selectorRef.current( state );
            
            // Only update state if the value has actually changed (deep equality)
            if ( !isEqual( lastSelectedRef.current, nextValue ) ) {
                lastSelectedRef.current = nextValue;
                setSelectedState( nextValue );
            }
        } );

        // Check if the value changed since initial render
        const state = formStore.get();
        const nextValue = selectorRef.current( state );
        if ( !isEqual( lastSelectedRef.current, nextValue ) ) {
            lastSelectedRef.current = nextValue;
            setSelectedState( nextValue );
        }

        return unsubscribe;
    }, [ formStore ] );

    return selectedState;
};
