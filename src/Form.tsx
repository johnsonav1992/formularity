import {
    ComponentProps
    , PropsWithChildren
} from 'react';

// Hooks
import { useFormularity } from './useFormularity';
import {
    FormStore
    , FormValues
} from './types';
import { throwFormStoreError } from './withFormStore';

export type FormProps<TFormValues extends FormValues> = PropsWithChildren<ComponentProps<'form'>> & { formStore?: FormStore<TFormValues> };

/**
 * The <Form /> component is a simple
 * wrapper around an html `<form>`
 * that abstracts away the `onSubmit` and
 * `onReset` handlers and allows `<Formularity />`
 * to take control of them. `<Formularity />` uses this
 * component by default but can be turned off if a
 * manual implementation of a form is desired.
 */
export const Form = <TFormValues extends FormValues>( {
    children
    , ...props
}: FormProps<TFormValues> ) => {
    if ( !props.formStore ) return throwFormStoreError( 'Form' );

    const formularity = useFormularity( { formStore: props.formStore } );

    const {
        formStore: _unusedFormStore
        , ...restProps
    } = props; //don't pass formStore to underlying dom node

    return (
        <form
            onSubmit={ formularity?.handleSubmit }
            onReset={ formularity?.handleReset }
            { ...restProps }
        >
            { children }
        </form>
    );
};
