// Types
import {
    FormValues
    , SingleFieldValidator
} from '../types';
import {
    DeepKeys
    , DeepValue
} from '../utilityTypes';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const required = <
    TFormValues extends FormValues = FormValues
    , TFieldName extends DeepKeys<TFormValues> = DeepKeys<TFormValues>
>( message?: string ): SingleFieldValidator<TFormValues, TFieldName> => {
    return ( value: DeepValue<TFormValues, TFieldName> ) => {
        if ( value == null || value === '' ) {
            return message || 'This field is required';
        }

        return null;
    };
};

export const requiredTrue = <
    TFormValues extends FormValues = FormValues
    , TFieldName extends DeepKeys<TFormValues> = DeepKeys<TFormValues>
>( message?: string ): SingleFieldValidator<TFormValues, TFieldName> => {
    return ( value: DeepValue<TFormValues, TFieldName> ) => {
        if ( typeof value !== 'boolean' ) {
            throw new Error( 'requiredTrue validator can only be used with boolean fields' );
        }

        if ( value !== true ) {
            return message || 'This field is required';
        }

        return null;
    };
};

export const min = <
    TFormValues extends FormValues,
    TFieldName extends DeepKeys<TFormValues>
>( min: number, message?: string ): SingleFieldValidator<TFormValues, TFieldName> => {
    return ( ( value: DeepValue<TFormValues, TFieldName> ) => {
        if ( typeof value == 'number' ) {
            if ( value < min ) {
                return message || `Must be more than ${ min }`;
            }
        } else if ( Array.isArray( value ) || typeof value == 'string' ) {
            const isArray = Array.isArray( value );

            if ( value.length < min ) {
                return message || `Must have at least ${ min } ${ isArray ? 'items long' : 'characters' }`;
            }
        }

        return null;
    } ) as SingleFieldValidator<TFormValues, TFieldName>;
};

export const max = <
    TFormValues extends FormValues,
    TFieldName extends DeepKeys<TFormValues>
>( max: number, message?: string ): SingleFieldValidator<TFormValues, TFieldName> => {
    return ( ( value: DeepValue<TFormValues, TFieldName> ) => {
        if ( typeof value == 'number' ) {
            if ( value < max ) {
                return message || `Must be less than ${ max }`;
            }
        } else if ( Array.isArray( value ) || typeof value == 'string' ) {
            const isArray = Array.isArray( value );

            if ( value.length < max ) {
                return message || `Must be no more than ${ max } ${ isArray ? 'items long' : 'characters' }`;
            }
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
        if ( typeof value !== 'string' || !EMAIL_REGEX.test( value ) ) {
            return message || 'Invalid email address';
        }

        return null;
    };
};
