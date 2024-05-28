import { ReactNode } from 'react';

// Components
import { Form } from './Form';
import { Field } from './Field';
import { SubmitButton } from './SubmitButton';
import { ResetButton } from './ResetButton';

// Types
import {
    FieldComponent
    , FormValues
    , FormularityProps
    , ResetButtonComponent
    , SubmitButtonComponent
} from './types';
import {
    UseFormularityParams
    , useFormularity
} from './useFormularity';
import { FormularityContext } from './FormularityContext';

export type FormularityComponentProps<TFormValues extends FormValues> =
    UseFormularityParams<TFormValues>
    & {
        useFormComponent?: boolean;
        children: (
            formularity: FormularityProps<TFormValues>
            & {
                Field: FieldComponent<TFormValues>;
                SubmitButton: SubmitButtonComponent;
                ResetButton: ResetButtonComponent;
            }
        ) => ReactNode;
    };

export const Formularity = <TFormValues extends FormValues>( {
    children
    , useFormComponent = true
    , ...formularityProps
}: FormularityComponentProps<TFormValues> ) => {
    const formularity = useFormularity( { ...formularityProps } );

    const renderedChildren = children( {
        ...formularity
        , Field
        , SubmitButton
        , ResetButton
    } );

    return (
        <FormularityContext.Provider value={ formularity as FormularityProps }>
            {
                useFormComponent
                    ? (
                        <Form>
                            { renderedChildren }
                        </Form>
                    )
                    : renderedChildren
            }
        </FormularityContext.Provider>
    );
};
