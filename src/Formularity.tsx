import {
    ComponentProps
    , ReactNode
} from 'react';

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
import { ComponentLibraryConfig } from './component-library-configs/types';

export type FormularityComponentProps<TFormValues extends FormValues> =
    UseFormularityParams<TFormValues>
    & {
        /**
         * By default, `<Formularity />` uses the `<Form />` component to wrap its children.
         * If you want to use a custom form component or none at all, set this to `false`.
         */
        useFormComponent?: boolean;
        /**
         * Props to pass to the `<form />` element.
         */
        formProps?: ComponentProps<'form'>;
        /**
         * Config for the component library to use for the form.
         * This is helpful for mitigating some unexpected behaviors
         * with components from libraries when passed to the `component`
         * prop of the `<Field />` component.
         */
        componentLibrary?: ComponentLibraryConfig;
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
    , formProps
    , ...formularityProps
}: FormularityComponentProps<TFormValues> ) => {
    const formularity = useFormularity( { ...formularityProps } );

    const renderedChildren = children( formularity );

    return (
        <FormularityContext.Provider
            value={ {
                ...formularity as FormularityProps
                , componentLibrary: formularityProps.componentLibrary
            } }
        >
            {
                useFormComponent
                    ? (
                        <Form { ...formProps }>
                            { renderedChildren }
                        </Form>
                    )
                    : renderedChildren
            }
        </FormularityContext.Provider>
    );
};
