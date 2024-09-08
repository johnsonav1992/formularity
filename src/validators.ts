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
