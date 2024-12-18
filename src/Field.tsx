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
    FieldEffectsConfig
    , FieldValidationOptions
    , FormErrors
    , FormTouched
    , FormValues
    , SingleFieldValidator
} from './types';
import {
    DeepKeys
    , DeepValue
    , IntrinsicFormElements
    , NoInfer
    , OnBlurEvent
    , OnChangeEvent
} from './utilityTypes';

// Utils
import {
    checkFieldEffectKeyNames
    , getViaPath
} from './generalUtils';

// Hooks
import { useFormularityContext } from './FormularityContext';

type DuplicateProps = 'name' | 'value' | 'type' | 'checked';

export type FieldProps<
    TFormValues extends FormValues
    , TFieldName extends DeepKeys<TFormValues> = DeepKeys<TFormValues>
    , TComponentProps = keyof IntrinsicFormElements
    , TShowErrors extends boolean = false
    , TLabel extends string | undefined = undefined
    , TFieldValue extends DeepValue<TFormValues, TFieldName> = DeepValue<TFormValues, TFieldName>
    , TShouldValidate extends boolean | undefined = true
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
         * The label to display for the field.
         * This uses a standard html `<label />` and can be customized
         * with the `labelProps` prop.
         */
        label?: TLabel;
        /**
         * Props to pass to the label. `label` must be set for these props to be accessible
         */
        labelProps?: NoInfer<TLabel> extends string ? {
            /**
             * Inline styles to apply to the label.
             */
            labelStyles?: CSSProperties;
            /**
             * Classes to apply to the label.
             */
            labelClasses?: string;
        } : never;
        /**
         * Quick utility prop to show errors for the field
         * should there be validation set up for it. Defaults to false.
         *
         * This prop is optional and may not be used so error display can be handled elsewhere.
         */
        showErrors?: TShowErrors;
        /**
         * Props to pass to the error message.
         * *Note: This prop is only available if `showErrors` is set to true.
         */
        errorProps?: NoInfer<TShowErrors> extends true ? {
            /**
             * Inline styles to apply to the error message.
             */
            errorStyles?: CSSProperties;
            /**
             * Classes to apply to the error message.
             */
            errorClasses?: string;
        } : never;
        /**
         * A custom validator to run on the field. Can be a manually defined
         * validation handler (see ex. below) or a third-party schema wrapped in an adapter.
         *
         * *Note: This validator will be run on every change or blur to the field
         * (unless the `shouldValidate` prop is set to false (in which case validation will not run) or the `validationEvent`
         * prop is set to either `onChange` or `onBlur` (in which case only that one type of event will run validation) and will
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
        validators?: SingleFieldValidator<TFormValues, TFieldName> | Array<SingleFieldValidator<TFormValues, TFieldName> >;
        /**
         * Whether to run validation after field value is updated or the field is blurred.
         * Setting this prop to `false` will cancel any validation set for the field.
         * Granular configuration of the field validation can be set with the `validationEvent`
         * prop if set to `true` or not set.
         *
         * @default true
         */
        shouldValidate?: TShouldValidate;
        /**
         * The field events for which validation should occur. *Only applies if
         * `shouldValidate` is set to `true` or not set at all.*
         *
         * Not setting this prop or setting this prop to `'all'` will run validation on every field
         * change or blur event.
         *
         * @default 'all'
         */
        validationEvent?: NoInfer<TShouldValidate> extends false
            ? never
            : 'onChange' | 'onBlur' | 'all';
        /**
         * Field effects are a super handy way to link field behavior together
         * or have some actions occur on one field as a result of another action
         * happening on another field.
         *
         * @param fieldEffectsConfig an object with all of the fields of the form as keys (minus the field
         * in which the effect config is being applied). Each event type object receives an object with all other fields
         * in the form. These functions will be called when the respective event occurs on the field
         * this config is being applied to and each callback will effect the
         * field being referred to in the config object. i.e. if an effect config is being applied to `<Field name='firstName' />`,
         * the `email` callback set for `onChange` will run when `firstName` changes and thus effect the `email` field accordingly.
         * See example below.
         *
         *
         * Config object structure -
         * @example
         *
         * ```ts
         * {
         *     onChange: { // fieldEffects to run on other fields when this field changes
         *         someField: () => {}
         *         , anotherField: () => {}
         *     }
         *     , onBlur: { // fieldEffects to run on other fields when this field blurs
         *          someField: () => {}
         *         , anotherField: () => {}
         *     }
         * }
         * ```
         *
         * In JSX -
         * @example
         *
         * ```jsx
         * <Field
                name='firstName'
                fieldEffects={ {
                    onChange: {
                        // val and helpers here are for the email field
                        // This callback would be called onChange of firstName
                        email: ( val, { validateField } ) => {
                            validateField( { shouldTouchField: true } );
                        }
                    }
                } }
            />
         * ```
         *
         */
        fieldEffects?: FieldEffectsConfig<TFormValues, TFieldName>;
        /**
         * A function to transform the field value at onChange time.
         *
         * @example
         *
         *```ts
         * // Will make the value uppercase on change
         * valueTransform={(value) => {
         *   return value.split('').map(letter => letter.toUpperCase()).join('');
         * }}
         *
         *```
         */
        valueTransform?: ( value: DeepValue<TFormValues, TFieldName> ) => DeepValue<TFormValues, TFieldName> ;
        /**
         * Children that may need to be passed to the `<Field />` component.
         *
         * *This will generally only be used for components like `<select />` or
         * any custom component that requires children rendering in order to work.
         */
        children?: ReactNode;
    };

/**
 * The `<Field />` component is the main component for hooking up inputs and
 * sections of forms in Formularity. It drastically reduces the amount of
 * boilerplate code needed to manage the state of a form field by taking care of
 * many basic actions such as handling change, blur, and showing errors. **Must
 * be used underneath a `<Formularity />` component.**
 */
export const Field = <
    TFormValues extends FormValues
    , TFieldName extends DeepKeys<TFormValues> = DeepKeys<TFormValues>
    , TComponentProps = keyof IntrinsicFormElements
    , TShowErrors extends boolean = false
    , TLabel extends string | undefined = undefined
    , TFieldValue extends DeepValue<TFormValues, TFieldName> = DeepValue<TFormValues, TFieldName>
    , TShouldValidate extends boolean | undefined = true
    >( {
        name
        , value
        , type
        , checked
        , component
        , label
        , labelProps
        , showErrors
        , errorProps
        , validators
        , shouldValidate
        , validationEvent
        , fieldEffects
        , valueTransform
        , ...props
    }: FieldProps<
        TFormValues
        , TFieldName
        , TComponentProps
        , TShowErrors
        , TLabel
        , TFieldValue
        , TShouldValidate
    > ) => {

    const {
        values
        , errors
        , touched
        , handleChange
        , handleBlur
        , registerField
        , unregisterField
        , componentLibrary
    } = useFormularityContext<TFormValues>();

    const id = 'id' in props ? props.id as string : undefined;

    fieldEffects && checkFieldEffectKeyNames( fieldEffects );

    useEffect( () => {
        registerField( {
            name
            , type
            , validationHandlers: validators || null
            , fieldId: id
            , fieldEffects
        } );

        return () => {
            unregisterField( name );
        };
    }, [ name ] );

    const renderedComponent = component as FC || 'input';
    const fieldValueState = getViaPath( values, name );

    console.log( componentLibrary );

    if ( componentLibrary?.checkboxConfig?.checker?.( renderedComponent ) ) type = 'checkbox';

    const fieldValidationOptions = {
        shouldValidate
        , validationEvent
    } as FieldValidationOptions;

    const fieldProps = {
        name
        , value: valueTransform && fieldValueState
            ? valueTransform( fieldValueState )
            : value || fieldValueState
        , checked: checked || ( type === 'checkbox' )
            ? value == undefined
                ? fieldValueState
                : value
            : undefined
        , onChange: ( e: OnChangeEvent ) => handleChange( e, fieldValidationOptions )
        , onBlur: ( e: OnBlurEvent ) => handleBlur( e, fieldValidationOptions )
        , type
        , ... props
    };

    const error = getViaPath( errors, name as DeepKeys<FormErrors<FormValues>> );
    const isTouched = getViaPath( touched, name as DeepKeys<FormTouched<FormValues>> );

    return (
        <>
            {
                label
                && (
                    <label
                        htmlFor={ name || id }
                        style={ labelProps?.labelStyles }
                        className={ labelProps?.labelClasses }
                    >
                        { label }
                    </label>
                )
            }
            {
                React.createElement<typeof fieldProps>(
                    renderedComponent
                    , fieldProps
                    , props.children
                )
            }
            {
                showErrors
                && error
                && isTouched
                && (
                    <div
                        style={ errorProps?.errorStyles }
                        className={ errorProps?.errorClasses }
                    >
                        { error }
                    </div>
                )
            }
        </>
    );
};
