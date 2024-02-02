import { PropsWithChildren } from 'react';

// Types
import {
    FormValues
    , FormularityProps
} from './types';

type FormProps<TFormValues extends FormValues> = PropsWithChildren<{
    formularity?: FormularityProps<TFormValues>;
}>;

export const Form = <TFormValues extends FormValues>( {
    formularity
    , children
}: FormProps<TFormValues> ) => {

    console.log( formularity?.handleSubmit );
    return (
        <form
            onSubmit={ formularity?.handleSubmit }
            onReset={ formularity?.handleReset }
        >
            { children }
        </form>
    );
};
