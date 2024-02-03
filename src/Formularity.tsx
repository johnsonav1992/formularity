import {
    PropsWithChildren
    , createContext
    , useContext
} from 'react';

// Components
import { Form } from './Form';
import { ConditionalWrapper } from './ConditionalWrapper';

// Types
import {
    FormValues
    , FormularityProps
} from './types';
import {
    UseFormularityParams
    , useFormularity
} from './useFormularity';

type Props<TFormValues extends FormValues> = UseFormularityParams<TFormValues> & { useFormComponent?: boolean };

const FormularityContext = createContext<FormularityProps<FormValues> | null>( null );

export const Formularity = <TFormValues extends FormValues>( {
    children
    , useFormComponent = true
    , ...formularityProps
}: PropsWithChildren<Props<TFormValues>> ) => {

    const formularity = useFormularity( { ...formularityProps } );

    return (
        <FormularityContext.Provider value={ formularity }>
            <ConditionalWrapper
                condition={ useFormComponent }
                wrapper={ children => (
                    <Form>
                        { children }
                    </Form>
                ) }
            >
                { children }
            </ConditionalWrapper>
        </FormularityContext.Provider>
    );
};

export const useFormularityContext = () => {
    if ( FormularityContext == null ) {
        throw new Error(
            `Must use any Formularity custom component within 
            a <Formularity /> component in order for it to work!`
        );
    }

    return useContext( FormularityContext ) as FormularityProps<FormValues>;
};
