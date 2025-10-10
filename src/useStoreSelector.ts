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
    const selectorRef = useRef(selector);
    selectorRef.current = selector;

    const lastSelectedRef = useRef<TSelected>(
        (() => {
            const state = store.get();
            return selectorRef.current(state);
        })()
    );

    const getSnapshot = useMemo(() => {
        return () => {
            const state = store.get();
            const selected = selectorRef.current(state);

            if (!isEqual(lastSelectedRef.current, selected)) {
                lastSelectedRef.current = selected;
            }

            return lastSelectedRef.current;
        };
    }, [store]);

    return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}
