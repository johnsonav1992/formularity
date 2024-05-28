import {
    createContext
    , useContext
} from 'react';
import { FormularityProps } from './types';

export const FormularityContext = createContext<FormularityProps | null>( null );

export const useFormularityContext = () => {
    const formularity = useContext( FormularityContext );

    if ( !formularity ) {
        throw new Error(
            `Must use any Formularity custom component within 
            a <Formularity /> component in order for it to work!`
        );
    }

    return formularity;
};
