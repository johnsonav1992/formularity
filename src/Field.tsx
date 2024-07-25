import React, {
    CSSProperties
    , ChangeEvent, ComponentProps
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
import { getViaPath } from './generalUtils';

// Hooks
import { useFormularityContext } from './FormularityContext';

type DuplicateProps = 'name' | 'value' | 'type' | 'checked';

//TODO: add in field validation options type here
export type FieldProps<
    TFormValues extends FormValues
    , TFieldName extends DeepKeys<TFormValues> = DeepKeys<TFormValues>
    , TComponentProps = keyof IntrinsicFormElements
    , TShowErrors extends boolean = false
    , TLabel extends string | undefined = undefined
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
         *
         *
         */
        //TODO: best way to define this
        fieldValidationOptions?: any;
        /**
         * Children that may need to be passed to the `<Field />` component.
         *
         * *This will generally only be used for components like `<select />` or
         * any custom component that requires children rendering in order to work.
         */
        children?: ReactNode;

    };

/**
 * The `<Field />` component is the main building-block of forms in
 * Formularity. It drastically reduces the amount of boilerplate code
 * needed to manage the state of a form field by taking care of many basic
 * actions such as handling change, blur, and showing errors. **Must be used
 * underneath a `<Formularity />` component.**
 */
export const Field = <
    TFormValues extends FormValues
    , TFieldName extends DeepKeys<TFormValues> = DeepKeys<TFormValues>
    , TComponentProps = keyof IntrinsicFormElements
    , TShowErrors extends boolean = false
    , TLabel extends string | undefined = undefined
    , TFieldValue extends DeepValue<TFormValues, TFieldName> = DeepValue<TFormValues, TFieldName>
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
        , validator
        , fieldValidationOptions
        , ...props
    }: FieldProps<
        TFormValues
        , TFieldName
        , TComponentProps
        , TShowErrors
        , TLabel
        , TFieldValue
    > ) => {

    const {
        values
        , errors
        , touched
        , handleChange
        , handleBlur
        , registerField
        , unregisterField
    } = useFormularityContext<TFormValues>();

    const id = 'id' in props ? props.id as string : undefined;

    useEffect( () => {
        registerField( {
            name
            , type
            , validationHandler: validator || null
            , fieldId: id
        } );

        return () => {
            unregisterField( name );
        };
    }, [ name ] );

    const renderedComponent = component as FC || 'input';
    const fieldValueState = getViaPath( values, name );

    // TODO: need to get this working again
    const isSilentExternalCheckbox = type == undefined
        && !!component
        && checked != undefined;

    //TODO: pass in the field validation props here to handle change
    const fieldProps = {
        name
        , value: value || fieldValueState
        , checked: ( type === 'checkbox' || isSilentExternalCheckbox )
            ? value == undefined
                ? fieldValueState
                : value
            : undefined
        , onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleChange(e, fieldValidationOptions)
        , onBlur: handleBlur
        , type: isSilentExternalCheckbox ? 'checkbox' : type
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
