import { PropsWithChildren } from 'react';

// Hooks
import { useFormularityContext } from './Formularity';

type FormProps = PropsWithChildren<{}>;

export const Form = ( { children }: FormProps ) => {
    const formularity = useFormularityContext();

    return (
        <form
            onSubmit={ formularity?.handleSubmit }
            onReset={ formularity?.handleReset }
        >
            { children }
        </form>
    );
};
