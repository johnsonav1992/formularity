import React, {
    CSSProperties
    , ComponentProps
    , FC
    , HTMLInputTypeAttribute
} from 'react';

// Types
import {
    FormErrors
    , FormStore
    , FormTouched
    , FormValues
} from './types';

// Utils
import { getViaPath } from './utils';

// Components
import { ConditionalWrapper } from './ConditionalWrapper';

// Hooks
import { useFormularity } from './useFormularity';
import { useFormularityContext } from './Formularity';

type FieldProps<
    TFormValues extends FormValues
    , TComponentProps extends Record<string, unknown>
    , TShowErrors extends boolean
> = Omit<ComponentProps<'input'>, 'name' | 'value' | 'type' | 'checked'>
    & {
        name: keyof TFormValues | ( string & {} );
        formStore?: FormStore<TFormValues>;
        value?: unknown;
        type?: HTMLInputTypeAttribute | ( string & {} ) | undefined ;
        checked?: boolean;
        component?: FC<TComponentProps>;
        showErrors?: TShowErrors;
        errorStyles?: TShowErrors extends true ? CSSProperties : never;
    }
    & TComponentProps;

export const Field = <
    TFormValues extends FormValues
    , TComponentProps extends Record<string, unknown>
    , TShowErrors extends boolean = false
    >( {
        name
        , formStore
        , value
        , type
        , checked
        , component
        , showErrors
        , errorStyles
        , ...props
    }: FieldProps<TFormValues, TComponentProps, TShowErrors> ) => {
    const formularity = useFormularityContext();
    const formularityProps = formStore ? useFormularity( { formStore } ) : formularity;

    const renderedComponent = component as unknown as FC || 'input';

    const fieldProps = {
        name
        , value: value || getViaPath( formularityProps?.values, name as string )
        , checked: type === 'checkbox'
            ? value == undefined
                ? checked
                : !!getViaPath( formularityProps?.values, name as string )
            : undefined
        , onChange: formularityProps?.handleChange
        , onBlur: formularityProps?.handleBlur
        , type: type || 'text'
    };

    const error = formularityProps?.errors[ name as keyof FormErrors<FormValues> ];
    const touched = formularityProps?.touched[ name as keyof FormTouched<FormValues> ];

    return (
        <ConditionalWrapper
            condition={ showErrors }
            wrapper={ children => (
                <div>
                    { children }
                    {
                        error
                        && touched
                        && (
                            <div style={ errorStyles }>
                                { error }
                            </div>
                        )
                    }
                </div>
            ) }
        >
            {
                React.createElement<typeof fieldProps>(
                    renderedComponent
                    , {
                        ...fieldProps
                        , ...props
                    }
                )
            }
        </ConditionalWrapper>
    );
};
