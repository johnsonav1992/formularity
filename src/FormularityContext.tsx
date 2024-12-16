import {
    createContext
    , useContext
} from 'react';

// Types
import {
    FormValues
    , FormularityProps
} from './types';
import { ComponentLibraryConfig } from './component-library-configs/types';

export const FormularityContext = createContext< ( FormularityProps & {
    componentLibrary?: ComponentLibraryConfig;
} ) | null>( null );

export type UseFormularityContextReturn<TFormValues extends FormValues> =
    FormularityProps<TFormValues> & { componentLibrary?: ComponentLibraryConfig };

export const useFormularityContext = <
    TFormValues extends FormValues = FormValues
>(): UseFormularityContextReturn<TFormValues> => {
    const formularityCtx: ReturnType<typeof useFormularityContext> = useContext( FormularityContext as never );

    if ( !formularityCtx ) {
        throw new Error(
            `Must use any Formularity custom component within 
            a <Formularity /> component in order for it to work!`
        );
    }

    return formularityCtx as never;
};
