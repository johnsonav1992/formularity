import React, {
    CSSProperties
    , ComponentProps
    , FC
    , HTMLInputTypeAttribute
} from 'react';

// Types
import {
    FormErrors
    , FormTouched
    , FormValues
} from './types';
import {
    DeepKeys
    , DeepValue
    , NoInfer
} from './utilityTypes';

// Utils
import { getViaPath } from './utils';

// Components
import { ConditionalWrapper } from './ConditionalWrapper';

// Hooks
import { useFormularityContext } from './Formularity';

type DuplicateProps = 'name' | 'value' | 'type' | 'checked';

export type FieldProps<
    TFormValues extends FormValues
    , TFieldName extends DeepKeys<TFormValues> = DeepKeys<TFormValues>
    , TComponentProps = {}
    , TShowErrors extends boolean = false
    , TFieldValue extends DeepValue<TFormValues, TFieldName> = DeepValue<TFormValues, TFieldName>
> = Omit<ComponentProps<'input'>, DuplicateProps>
    & {
        name: TFieldName;
        value?: TFieldValue;
        type?: HTMLInputTypeAttribute | ( string & {} ) | undefined ;
        checked?: boolean;
        component?: FC<TComponentProps> | keyof JSX.IntrinsicElements;
        showErrors?: TShowErrors;
        errorStyles?: NoInfer<TShowErrors> extends true ? CSSProperties : never;
    }
    & NoInfer<TComponentProps>;

export const Field = <
    TFormValues extends FormValues
    , TFieldName extends DeepKeys<TFormValues> = DeepKeys<TFormValues>
    , TComponentProps = {}
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
    const {
        values
        , errors
        , touched
        , handleChange
        , handleBlur
    } = useFormularityContext();

    const renderedComponent = component as FC || 'input';

    const isSilentExternalCheckbox = type == undefined
        && component
        && ( checked == true || checked == false );

    const fieldProps = {
        name
        , value: value || getViaPath( values, name as DeepKeys<FormValues> )
        , checked: ( isSilentExternalCheckbox || type === 'checkbox' )
            ? value == undefined
                ? checked
                : !!getViaPath( values, name as DeepKeys<FormValues> )
            : undefined
        , onChange: handleChange
        , onBlur: handleBlur
        , type: isSilentExternalCheckbox ? 'checkbox' : type
        , ... props
    };

    const error = getViaPath( errors, name as DeepKeys<FormErrors<FormValues>> );
    const isTouched = getViaPath( touched, name as DeepKeys<FormTouched<FormValues>> );

    return (
        <ConditionalWrapper
            condition={ showErrors }
            wrapper={ children => (
                <>
                    { children }
                    {
                        error
                        && isTouched
                        && (
                            <div style={ errorStyles }>
                                { error }
                            </div>
                        )
                    }
                </>
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
