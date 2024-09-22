// Types
import { getViaPath } from '../generalUtils';
import {
    FormValues
    , SingleFieldValidator
} from '../types';
import {
    DeepKeys
    , DeepValue
} from '../utilityTypes';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const invalidValidatorMsg = (
    fieldName: unknown,
    validatorName: string,
    type: string
) => `Invalid validator on '${ fieldName || '' }'. ${ validatorName } validator can only be used with ${ type } fields`;

/**
 * Validator for making a field required
 */
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

/**
 * Validator for making a field required as `true`
 *
 * **Can only be used with boolean fields
 */
export const requiredTrue = <
    TFormValues extends FormValues = FormValues
    , TFieldName extends DeepKeys<TFormValues> = DeepKeys<TFormValues>
>( message?: string ): SingleFieldValidator<TFormValues, TFieldName> => {
    return ( value: DeepValue<TFormValues, TFieldName>, opts ) => {
        if ( typeof value !== 'boolean' ) {
            throw new Error( invalidValidatorMsg( opts?.fieldName, 'requiredTrue', 'boolean' ) );
        }

        if ( value !== true ) {
            return message || 'This field is required';
        }

        return null;
    };
};

/**
 * Validator for setting a minimum value
 *
 * **Can be used with number, string or array fields (operates on array length)
 */
export const min = <
    TFormValues extends FormValues,
    TFieldName extends DeepKeys<TFormValues>
>( min: number, message?: string ): SingleFieldValidator<TFormValues, TFieldName> => {
    return ( ( value: DeepValue<TFormValues, TFieldName> ) => {
        if ( typeof value === 'boolean' ) {
            throw new Error( invalidValidatorMsg( value, 'min', 'number or string or array' ) );
        }

        if ( typeof value == 'number' ) {
            if ( value < min ) {
                return message || `Must be more than ${ min }`;
            }
        } else if ( Array.isArray( value ) || typeof value == 'string' ) {
            const isArray = Array.isArray( value );

            if ( value.length < min ) {
                return message || `Must have at least ${ min } ${ isArray ? 'items' : 'characters' }`;
            }
        }

        return null;
    } ) as SingleFieldValidator<TFormValues, TFieldName>;
};

/**
 * Validator for setting a maximum value
 *
 * **Can be used with number, string or array fields (operates on array length)
 */
export const max = <
    TFormValues extends FormValues,
    TFieldName extends DeepKeys<TFormValues>
>( max: number, message?: string ): SingleFieldValidator<TFormValues, TFieldName> => {
    return ( ( value: DeepValue<TFormValues, TFieldName> ) => {
        if ( typeof value === 'boolean' ) {
            throw new Error( invalidValidatorMsg( value, 'min', 'number or string or array' ) );
        }

        if ( typeof value == 'number' ) {
            if ( value < max ) {
                return message || `Must be less than ${ max }`;
            }
        } else if ( Array.isArray( value ) || typeof value == 'string' ) {
            const isArray = Array.isArray( value );

            if ( value.length < max ) {
                return message || `Must be no more than ${ max } ${ isArray ? 'items' : 'characters' }`;
            }
        }

        return null;
    } ) as SingleFieldValidator<TFormValues, TFieldName>;
};

/**
 * Validator for checking against a regex pattern
 */
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

/**
 * Validator for checking correct email address formatting
 */
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

/**
 * Validator for checking if the value of the field matches another field's value.
 * Great for common use cases like password and confirm password fields
 */
export const matchField = <
    TFormValues extends FormValues = FormValues,
    TFieldName extends DeepKeys<TFormValues> = DeepKeys<TFormValues>,
    TFieldToMatch = DeepKeys<TFormValues>
>( fieldToMatch: TFieldToMatch, message?: string ): SingleFieldValidator<TFormValues, TFieldName> => {
    return ( value: DeepValue<TFormValues, TFieldName>, opts ) => {
        const otherFieldValue = getViaPath( opts?.formValues, fieldToMatch as never );

        if ( value !== otherFieldValue ) {
            return message || `Must match ${ fieldToMatch }`;
        }

        return null;
    };
};
