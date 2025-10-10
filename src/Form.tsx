import {
    ComponentProps
    , PropsWithChildren
} from 'react';

// Hooks
import { useFormHandlers } from './FormHandlersContext';

export type FormProps = PropsWithChildren<ComponentProps<'form'>>;

/**
 * The <Form /> component is a simple
 * wrapper around an html `<form>`
 * that abstracts away the `onSubmit` and
 * `onReset` handlers and allows `<Formularity />`
 * to take control of them. `<Formularity />` uses this
 * component by default but can be turned off if a
 * manual implementation of a form is desired.
 */
export const Form = ( {
    children
    , ...props
}: FormProps ) => {
    const { handleSubmit, handleReset } = useFormHandlers();

    return (
        <form
            onSubmit={ handleSubmit }
            onReset={ handleReset }
            { ...props }
        >
            { children }
        </form>
    );
};
