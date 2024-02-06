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
    , FormTouched
    , FormValues
} from './types';

// Utils
import { getViaPath } from './utils';

// Components
import { ConditionalWrapper } from './ConditionalWrapper';

// Hooks
import { useFormularityContext } from './Formularity';

export type FieldProps<
    TFormValues extends FormValues
    , TFieldName extends DeepKeys<TFormValues>
    , TComponentProps extends Record<string, unknown> = {}
    , TShowErrors extends boolean = false
    , TFieldValue extends DeepValue<TFormValues, TFieldName> = DeepValue<TFormValues, TFieldName>
> = Omit<ComponentProps<'input'>, 'name' | 'value' | 'type' | 'checked'>
    & {
        name: TFieldName;
        value?: TFieldValue;
        type?: HTMLInputTypeAttribute | ( string & {} ) | undefined ;
        checked?: boolean;
        component?: FC<TComponentProps>;
        showErrors?: TShowErrors;
        errorStyles?: TShowErrors extends true ? CSSProperties : never;
    }
    & TComponentProps;

export const Field = <
    TFormValues extends FormValues
    , TFieldName extends DeepKeys<TFormValues> = DeepKeys<TFormValues>
    , TComponentProps extends Record<string, unknown> = {}
    , TShowErrors extends boolean = false
    , TFieldValue extends DeepValue<TFormValues, TFieldName> = DeepValue<TFormValues, TFieldName>
    >( {
        name
        , value
        , type
        , checked
        , component
        , showErrors
        , errorStyles
        , ...props
    }: FieldProps<TFormValues, TFieldName, TComponentProps, TShowErrors, TFieldValue> ) => {
    const formularityProps = useFormularityContext();

    const renderedComponent = component as unknown as FC || 'input';

    const fieldProps = {
        name
        , value: value || getViaPath( formularityProps?.values, name )
        , checked: type === 'checkbox'
            ? value == undefined
                ? checked
                : !!getViaPath( formularityProps?.values, name )
            : undefined
        , onChange: formularityProps?.handleChange
        , onBlur: formularityProps?.handleBlur
        , type: type || 'text'
        , ... props
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
                React.createElement(
                    renderedComponent
                    , fieldProps
                )
            }
        </ConditionalWrapper>
    );
};
