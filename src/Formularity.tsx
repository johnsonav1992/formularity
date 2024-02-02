import { PropsWithChildren } from 'react';

// Components
import { AutoBindFormStore } from './AutoBindFormStore';
import { Form } from './Form';
import { ConditionalWrapper } from './ConditionalWrapper';

// Types
import { FormValues } from './types';
import {
    UseFormularityParams
    , useFormularity
} from './useFormularity';

type Props<TFormValues extends FormValues> = UseFormularityParams<TFormValues> & { useFormComponent?: boolean };

export const Formularity = <TFormValues extends FormValues>( {
    children
    , useFormComponent = true
    , ...formularityProps
}: PropsWithChildren<Props<TFormValues>> ) => {

    const formularity = useFormularity( { ...formularityProps } );

    return (
        <AutoBindFormStore formularity={ formularity }>
            <ConditionalWrapper
                condition={ useFormComponent }
                wrapper={ children => (
                    <Form formularity={ formularity }>
                        { children }
                    </Form>
                ) }
            >
                { children }
            </ConditionalWrapper>
        </AutoBindFormStore>
    );
};
