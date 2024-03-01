import React, {
    CSSProperties
    , ComponentProps
    , FC
    , HTMLInputTypeAttribute
    , ReactNode
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
    , IntrinsicFormElements
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
    , TComponentProps = keyof IntrinsicFormElements
    , TShowErrors extends boolean = false
    , TFieldValue extends DeepValue<TFormValues, TFieldName> = DeepValue<TFormValues, TFieldName>
> = ( TComponentProps extends undefined
        ? Omit<ComponentProps<'input'>, DuplicateProps>
        : TComponentProps extends keyof IntrinsicFormElements
            ? Omit<ComponentProps<TComponentProps>, DuplicateProps>
            : Omit<NoInfer<TComponentProps>, DuplicateProps>
    ) & {
        name: TFieldName;
        value?: TFieldValue;
        type?: HTMLInputTypeAttribute | ( string & {} ) | undefined ;
        checked?: boolean;
        component?: FC<TComponentProps> | keyof IntrinsicFormElements;
        showErrors?: TShowErrors;
        errorStyles?: NoInfer<TShowErrors> extends true ? CSSProperties : never;
        children?: ReactNode;
    };

export const Field = <
    TFormValues extends FormValues
    , TFieldName extends DeepKeys<TFormValues> = DeepKeys<TFormValues>
    , TComponentProps = keyof IntrinsicFormElements
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
        && !!component
        && ( checked == true || checked == false );

    const fieldProps = {
        name
        , value: value || getViaPath( values, name as DeepKeys<FormValues> )
        , checked: ( type === 'checkbox' || isSilentExternalCheckbox )
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
                React.createElement<typeof fieldProps>(
                    renderedComponent
                    , fieldProps
                    , props.children
                )
            }
        </ConditionalWrapper>
    );
};
