import React, {
    CSSProperties
    , ComponentProps
    , FC
    , HTMLInputTypeAttribute
} from 'react';

// Types
import {
    DeepKeys
    , DeepValue
    , FormErrors
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
    , TFieldName extends DeepKeys<TFormValues>
    , TComponentProps extends Record<string, unknown>
    , TShowErrors extends boolean
> = Omit<ComponentProps<'input'>, 'name' | 'value' | 'type' | 'checked'>
    & {
        name: TFieldName;
        value?: DeepValue<TFormValues, TFieldName>;
        type?: HTMLInputTypeAttribute | ( string & {} ) | undefined ;
        checked?: boolean;
        component?: FC<TComponentProps>;
        formStore?: FormStore<TFormValues>;
        showErrors?: TShowErrors;
        errorStyles?: TShowErrors extends true ? CSSProperties : never;
    }
    & TComponentProps;

export const Field = <
    TFormValues extends FormValues
    , TFieldName extends DeepKeys<TFormValues>
    , TComponentProps extends Record<string, unknown> = {}
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
    }: FieldProps<TFormValues, TFieldName, TComponentProps, TShowErrors> ) => {
    const formularity = useFormularityContext();
    const formularityProps = formStore ? useFormularity( { formStore } ) : formularity;

    const renderedComponent = component as unknown as FC || 'input';

    type FieldValue = TFieldName extends keyof TFormValues
    ? TFormValues[TFieldName]
    : never;

    const fieldProps = {
        name
        , value: value || getViaPath( formularityProps?.values, name ) as FieldValue
        , checked: type === 'checkbox'
            ? value == undefined
                ? checked
                : !!getViaPath( formularityProps?.values, name )
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
