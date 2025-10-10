import {
    ComponentProps
    , ReactNode
    , useMemo
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
import { FormStoreContext } from './FormStoreContext';
import { FormHandlersContext } from './FormHandlersContext';
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
    , componentLibrary
    , ...formularityProps
}: FormularityComponentProps<TFormValues> ) => {
    const formularity = useFormularity( { ...formularityProps } );
    const { formStore } = formularityProps;

    // Memoize handlers to prevent context from changing on every render
    const handlers = useMemo(() => ({
        handleChange: formularity.handleChange,
        handleBlur: formularity.handleBlur,
        handleSubmit: formularity.handleSubmit,
        handleReset: formularity.handleReset,
        setFieldValue: formularity.setFieldValue,
        setValues: formularity.setValues,
        setFieldError: formularity.setFieldError,
        setErrors: formularity.setErrors,
        setFieldTouched: formularity.setFieldTouched,
        setTouched: formularity.setTouched,
        validateForm: formularity.validateForm,
        validateField: formularity.validateField,
        registerField: formularity.registerField,
        unregisterField: formularity.unregisterField,
        componentLibrary
    }), [
        formularity.handleChange,
        formularity.handleBlur,
        formularity.handleSubmit,
        formularity.handleReset,
        formularity.setFieldValue,
        formularity.setValues,
        formularity.setFieldError,
        formularity.setErrors,
        formularity.setFieldTouched,
        formularity.setTouched,
        formularity.validateForm,
        formularity.validateField,
        formularity.registerField,
        formularity.unregisterField,
        componentLibrary
    ]);

    const renderedChildren = children( formularity );

    return (
        <FormStoreContext.Provider value={ formStore }>
            <FormHandlersContext.Provider value={ handlers as never }>
                {
                    useFormComponent
                        ? (
                            <Form { ...formProps }>
                                { renderedChildren }
                            </Form>
                        )
                        : renderedChildren
                }
            </FormHandlersContext.Provider>
        </FormStoreContext.Provider>
    );
};
