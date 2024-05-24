import React, {
    CSSProperties
    , ComponentProps
    , FC
    , HTMLInputTypeAttribute
    , ReactNode
    , useEffect
} from 'react';

// Types
import {
    FormErrors
    , FormTouched
    , FormValues
    , SingleFieldValidator
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
        /**
         * The name of the field. *required
         */
        name: TFieldName;
        /**
         * The value of the field.
         */
        value?: TFieldValue;
        /**
         * The type of the field. Refers to type that
         * would be passed to an HTML `<input />` component.
         * Defaults to 'text'.
         */
        type?: HTMLInputTypeAttribute | ( string & {} ) | undefined ;
        /**
         * Whether the field is checked. *only for use with `type='checkbox'`
         */
        checked?: boolean;
        /**
         * The component to render. Can be a string representation of an HTML element
         * or a custom component. Defaults to `<input />`.
         * *Note: The custom component must use an underlying HTML element that can be used
         * within a form in order to work properly.
         *
         * All of the passed components props will be available as props of `<Field />`
         * and typed accordingly
         */
        component?: FC<TComponentProps> | keyof IntrinsicFormElements;
        /**
         * Quick utility prop to show errors for the field
         * should their be validation set up for it. Defaults to false.
         *
         * This prop is optional and may not be used so error display can be handled elsewhere.
         */
        showErrors?: TShowErrors;
        /**
         * Styles to apply to the error message.
         * *Note: This prop is only available if `showErrors` is set to true.
         */
        errorStyles?: NoInfer<TShowErrors> extends true ? CSSProperties : never;
        /**
         * A custom validator to run on the field. Can be a manually defined
         * validation handler (see ex. below) or a third-party schema wrapped in an adapter.
         *
         * *Note: This validator will be run on every change to the field and will
         * take priority over any validation for that field that was set up in
         * the `validationSchema` passed to `createFormStore`.
         *
         * @returns error string or null/undefined if no error is found. *required
         *
         * @example
         * manual validator:
         *
         * ```
         * ( value ) => {
         *     if ( value.length < 5 ) {
         *         return 'Value must be at least 5 characters';
         *     }
         *
         *     return null;
         * };
         * ```
         *
         * 3rd party adapter:
         *
         * *Note - must use the
         * ```{ isField: true }```
         * option in order for the adapter to work properly.
         *
         *```
         * import { zodAdapter } from 'formularity-zod-adapter';
         *
         * validator={ zodAdapter( z.string().min(5), { isField: true } ) }
         * ```
         */
        validator?: SingleFieldValidator<TFormValues, TFieldName>;
        /**
         * Children that may need to be passed to the `<Field />` component.
         *
         * *This will generally only be used for components like `<select />` or
         * any custom component that requires children rendering in order to work.
         */
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
        , validator
        , ...props
    }: FieldProps<TFormValues, TFieldName, TComponentProps, TShowErrors, TFieldValue> ) => {

    const {
        values
        , errors
        , touched
        , handleChange
        , handleBlur
        , registerField
        , unregisterField
    } = useFormularityContext();

    useEffect( () => {
        registerField( {
            name
            , validationHandler: validator || null
            , fieldId: 'id' in props ? props.id : null
            , type: type
        } as never );

        return () => {
            unregisterField( name as never );
        };
    }, [ name ] );

    const renderedComponent = component as FC || 'input';

    const isSilentExternalCheckbox = type == undefined
        && !!component
        && checked != undefined;

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
