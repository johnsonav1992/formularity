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
