import {
    createContext
    , useContext
} from 'react';

// Types
import {
    FormValues
    , FormularityProps
    , FormStore
    , FieldRegistry
    , FormHandlers
    , FieldRegistration
} from './types';
import { ComponentLibraryConfig } from './component-library-configs/types';
import { DeepKeys } from './utilityTypes';

/**
 * The context now stores:
 * - formStore: the stable store object (never changes)
 * - handlers: stable handler functions (don't cause rerenders)
 * - fieldRegistry: stable ref to field registrations
 * - componentLibrary: stable config
 * - validation flags: stable boolean flags
 * 
 * This prevents unnecessary rerenders since these values are all stable
 */
export type FormularityContextValue<TFormValues extends FormValues = FormValues> = {
    formStore: FormStore<TFormValues>;
    handlers: FormHandlers<TFormValues> & FieldRegistration<TFormValues>;
    fieldRegistry: React.MutableRefObject<FieldRegistry<TFormValues>>;
    componentLibrary?: ComponentLibraryConfig;
    validateOnChange: boolean;
    validateOnBlur: boolean;
    validateOnSubmit: boolean;
};

export const FormularityContext = createContext<FormularityContextValue | null>( null );

export type UseFormularityContextReturn<TFormValues extends FormValues> =
    FormularityProps<TFormValues> & { componentLibrary?: ComponentLibraryConfig };

/**
 * Hook to get the stable context values (store, handlers, field registry, etc.)
 * This doesn't cause rerenders since these are stable references
 */
export const useFormularityContext = <
    TFormValues extends FormValues = FormValues
>(): FormularityContextValue<TFormValues> => {
    const formularityCtx = useContext( FormularityContext );

    if ( !formularityCtx ) {
        throw new Error(
            `Must use any Formularity custom component within 
            a <Formularity /> component in order for it to work!`
        );
    }

    return formularityCtx as FormularityContextValue<TFormValues>;
};
