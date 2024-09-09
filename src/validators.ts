import {
    FormValues
    , SingleFieldValidator
} from './types';
import {
    DeepKeys
    , DeepValue
} from './utilityTypes';

export const required = <
    TFormValues extends FormValues = FormValues
    , TFieldName extends DeepKeys<TFormValues> = DeepKeys<TFormValues>
>( message?: string ): SingleFieldValidator<TFormValues, TFieldName> => {
    return ( value: DeepValue<TFormValues, TFieldName> ) => {
        if ( !value ) {
            return message || 'This field is required';
        }

        return null;
    };
};

export const min = <
    TFormValues extends FormValues,
    TFieldName extends DeepKeys<TFormValues>
    >(
        min: DeepValue<TFormValues, TFieldName> extends number ? number : never
        , message?: string
    ): SingleFieldValidator<TFormValues, TFieldName> => {
    return ( ( value: number ) => {
        if ( value < min ) {
            return message || `Must be more than ${ min }`;
        }

        return null;
    } ) as SingleFieldValidator<TFormValues, TFieldName>;
};

export const max = <
    TFormValues extends FormValues,
    TFieldName extends DeepKeys<TFormValues>
    >(
        max: DeepValue<TFormValues, TFieldName> extends number ? number : never
        , message?: string
    ): SingleFieldValidator<TFormValues, TFieldName> => {
    return ( ( value: number ) => {
        if ( value > max ) {
            return message || `Must be less than ${ max }`;
        }

        return null;
    } ) as SingleFieldValidator<TFormValues, TFieldName>;
};

export const pattern = <
    TFormValues extends FormValues,
    TFieldName extends DeepKeys<TFormValues>
>( pattern: RegExp, message?: string ): SingleFieldValidator<TFormValues, TFieldName> => {
    return ( value: DeepValue<TFormValues, TFieldName> ) => {
        if ( !pattern.test( String( value ) ) ) {
            return message || 'Invalid format';
        }

        return null;
    };
};

export const email = <
    TFormValues extends FormValues = FormValues,
    TFieldName extends DeepKeys<TFormValues> = DeepKeys<TFormValues>
    >(
        message?: string
    ): SingleFieldValidator<TFormValues, TFieldName> => {
    return ( value: DeepValue<TFormValues, TFieldName> ) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if ( typeof value !== 'string' || !emailRegex.test( value ) ) {
            return message || 'Invalid email address';
        }

        return null;
    };
};
