import { ReactNode } from 'react';

// Components
import { Form } from './Form';

// Types
import {
    FormValues
    , FormularityProps
} from './types';
import {
    UseFormularityParams
    , useFormularity
} from './useFormularity';

// Context
import { FormularityContext } from './FormularityContext';

export type FormularityComponentProps<TFormValues extends FormValues> =
    UseFormularityParams<TFormValues>
    & {
        useFormComponent?: boolean;
        children: ( formularity: FormularityProps<TFormValues> ) => ReactNode;
    };

/**
 * `<Formularity />` is the main building block of all Formularity forms. Use it, along with a `formStore`,
 * to create easy-to-build flexible forms that can adapt to many different use cases.
 */
export const Formularity = <TFormValues extends FormValues>( {
    children
    , useFormComponent = true
    , ...formularityProps
}: FormularityComponentProps<TFormValues> ) => {
    const formularity = useFormularity( { ...formularityProps } );

    const renderedChildren = children( formularity );

    return (
        <FormularityContext.Provider value={ formularity as FormularityProps }>
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
