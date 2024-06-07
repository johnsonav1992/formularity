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
        /**
         * By default, `<Formularity />` uses the `<Form />` component to wrap its children.
         * If you want to use a custom form component or none at all, set this to `false`.
         */
        useFormComponent?: boolean;
        /**
         * The function that will be called to render the children of the `<Formularity />` component.
         * The Formularity props and components are passed to this function for an easy form-building experience.
         */
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
