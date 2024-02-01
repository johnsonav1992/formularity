import { PropsWithChildren } from 'react';

// Components
import { AutoBindFormStore } from './AutoBindFormStore';

// Types
import { FormValues } from './types/types';
import {
    UseFormularityParams
    , useFormularity
} from './useFormularity';

type Props<TFormValues extends FormValues> = UseFormularityParams<TFormValues>;

export const Formularity = <TFormValues extends FormValues>( {
    children
    , ...formularityProps
}: PropsWithChildren<Props<TFormValues>> ) => {

    const formularity = useFormularity( { ...formularityProps } );

    return (
        <AutoBindFormStore formularity={ formularity }>
            { children }
        </AutoBindFormStore>
    );
};
