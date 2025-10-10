import { useSyncExternalStore, useMemo, useRef } from 'react';
import type { FormStore, FormStoreState, FormValues } from './types';
import { isEqual } from './generalUtils';

/**
 * A hook that subscribes to a specific slice of the form store.
 * Only re-renders when the selected value changes (using deep equality).
 *
 * This is the key to preventing unnecessary re-renders - each component
 * can subscribe to only the data it needs.
 *
 * @param store - The form store to subscribe to
 * @param selector - A function that selects a slice of state
 * @returns The selected slice of state
 *
 * @example
 * // Only re-renders when firstName value, error, or touched changes
 * const fieldState = useStoreSelector(
 *   formStore,
 *   (state) => ({
 *     value: state.values.firstName,
 *     error: state.errors.firstName,
 *     touched: state.touched.firstName
 *   })
 * );
 */
export function useStoreSelector<
    TFormValues extends FormValues,
    TSelected
>(
    store: FormStore<TFormValues>,
    selector: (state: FormStoreState<TFormValues>) => TSelected
): TSelected {
    // Keep selector function stable across renders
    const selectorRef = useRef(selector);
    selectorRef.current = selector;

    // Initialize the ref with current value on mount (not on first change)
    const lastSelectedRef = useRef<TSelected>(
        (() => {
            const state = store.get();
            return selectorRef.current(state);
        })()
    );

    // Create a stable getSnapshot function that uses deep equality
    const getSnapshot = useMemo(() => {
        return () => {
            const state = store.get();
            const selected = selectorRef.current(state);

            // Only update the ref if the value actually changed (deep equality)
            // This ensures useSyncExternalStore gets the same reference for the same value
            if (!isEqual(lastSelectedRef.current, selected)) {
                lastSelectedRef.current = selected;
            }

            return lastSelectedRef.current;
        };
    }, [store]);

    // Provide getServerSnapshot to prevent hydration mismatches and initial sync issues
    // Even in client-only apps, this helps useSyncExternalStore optimize better
    return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}
