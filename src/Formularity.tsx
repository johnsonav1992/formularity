import { PropsWithChildren } from 'react';

// Components
import { AutoBindFormStore } from './AutoBindFormStore';

// Types
import { FormValues } from './types';
import {
    UseFormularityParams
    , useFormularity
} from './useFormularity';
import { ConditionalWrapper } from './ConditionalWrapper';
import { Form } from './Form';

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
