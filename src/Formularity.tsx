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
    formStore
    , children
    , manualValidationHandler
}: PropsWithChildren<Props<TFormValues>> ) => {

    console.log( manualValidationHandler );
    const formularity = useFormularity( {
        formStore
        , manualValidationHandler
    } );

    return (
        <AutoBindFormStore
            formStore={ formStore }
            manualValidationHandler={ manualValidationHandler }
        >
            { children }
        </AutoBindFormStore>
    );
};
