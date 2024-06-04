import {
    createContext
    , useContext
} from 'react';

// Types
import {
    FormValues
    , FormularityProps
} from './types';

export const FormularityContext = createContext<FormularityProps | null>( null );

export const useFormularityContext = <TFormValues extends FormValues = FormValues>() => {
    const formularity = useContext<FormularityProps<TFormValues>>( FormularityContext as never );

    if ( !formularity ) {
        throw new Error(
            `Must use any Formularity custom component within 
            a <Formularity /> component in order for it to work!`
        );
    }

    return formularity;
};
