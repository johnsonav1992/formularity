import {
    ReactNode
    , createContext
    , useContext
} from 'react';

// Components
import { Form } from './Form';

// Types
import {
    FieldComponent
    , FormValues
    , FormularityProps
} from './types';
import {
    UseFormularityParams
    , useFormularity
} from './useFormularity';
import { Field } from './Field';

type FormularityComponentProps<TFormValues extends FormValues> = UseFormularityParams<TFormValues> & {
    useFormComponent?: boolean;
    children: (
        formularity: FormularityProps<TFormValues>
        & {
            Field: FieldComponent<TFormValues>;
        }
    ) => ReactNode;
};

const FormularityContext = createContext<FormularityProps<FormValues> | null>( null );

export const Formularity = <TFormValues extends FormValues>( {
    children
    , useFormComponent = true
    , ...formularityProps
}: FormularityComponentProps<TFormValues> ) => {
    const formularity = useFormularity( { ...formularityProps } );
    const renderedChildren = children( {
        ...formularity
        , Field
    } );

    return (
        <FormularityContext.Provider value={ formularity }>
            {
                useFormComponent
                    ? (
                        <Form>
                            { renderedChildren }
                        </Form>
                    )
                    : renderedChildren
            }
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
