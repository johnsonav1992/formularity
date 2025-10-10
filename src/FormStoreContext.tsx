import { createContext, useContext } from 'react';
import type { FormStore, FormValues } from './types';

/**
 * Context that provides access to the form store.
 * Unlike the old FormularityContext, this only holds the store reference,
 * which never changes, so it doesn't cause re-renders.
 */
export const FormStoreContext = createContext<FormStore<any> | null>(null);

/**
 * Hook to access the form store from context.
 * This is stable and won't cause re-renders by itself.
 * Components should use useStoreSelector to subscribe to specific state slices.
 */
export function useFormStore<TFormValues extends FormValues = FormValues>(): FormStore<TFormValues> {
    const store = useContext(FormStoreContext);

    if (!store) {
        throw new Error(
            'useFormStore must be used within a Formularity component'
        );
    }

    return store as FormStore<TFormValues>;
}
