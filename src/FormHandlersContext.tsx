import { createContext, useContext } from 'react';
import type { FormHandlers, FormValues, FieldRegistration } from './types';
import type { ComponentLibraryConfig } from './component-library-configs/types';

/**
 * Context that provides form handlers and utilities.
 * These are stable functions (memoized with useCallback/useEventCallback)
 * so this context is also stable and won't cause re-renders.
 */
export type FormHandlersContextValue<TFormValues extends FormValues> =
    FormHandlers<TFormValues> &
    FieldRegistration<TFormValues> & {
        componentLibrary?: ComponentLibraryConfig;
    };

type UnknownFormHandlers = FormHandlersContextValue<Record<string, unknown>>;

export const FormHandlersContext = createContext<UnknownFormHandlers | null>(null);

/**
 * Hook to access form handlers from context.
 * These are stable functions that won't cause re-renders.
 */
export function useFormHandlers<TFormValues extends FormValues = FormValues>(): FormHandlersContextValue<TFormValues> {
    const handlers = useContext(FormHandlersContext);

    if (!handlers) {
        throw new Error(
            'useFormHandlers must be used within a Formularity component'
        );
    }

    return handlers as FormHandlersContextValue<TFormValues>;
}
