import {
    ComponentProps
    , PropsWithChildren
} from 'react';

// Hooks
import { useFormularityContext } from './FormularityContext';

export type FormProps = PropsWithChildren<ComponentProps<'form'>>;

export const Form = ( {
    children
    , ...props
}: FormProps ) => {
    const formularity = useFormularityContext();

    return (
        <form
            onSubmit={ formularity?.handleSubmit }
            onReset={ formularity?.handleReset }
            { ...props }
        >
            { children }
        </form>
    );
};
