import {
    ReactNode
    , createContext
    , useContext
} from 'react';

// Components
import { Form } from './Form';
import { Field } from './Field';
import { SubmitButton } from './SubmitButton';
import { ResetButton } from './ResetButton';

// Types
import {
    FieldComponent
    , FormValues
    , FormularityProps
    , ResetButtonComponent
    , SubmitButtonComponent
} from './types';
import {
    UseFormularityParams
    , useFormularity
} from './useFormularity';

export type FormularityComponentProps<TFormValues extends FormValues> =
    UseFormularityParams<TFormValues>
    & {
        useFormComponent?: boolean;
        children: (
            formularity: FormularityProps<TFormValues>
            & {
                Field: FieldComponent<TFormValues>;
                SubmitButton: SubmitButtonComponent;
                ResetButton: ResetButtonComponent;
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
        , SubmitButton
        , ResetButton
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
    const formularity = useContext( FormularityContext );

    if ( !formularity ) {
        throw new Error(
            `Must use any Formularity custom component within 
            a <Formularity /> component in order for it to work!`
        );
    }

    return formularity;
};
