import { FormValues } from './types/types';

export class Formularity<TFormValues extends FormValues> {
    public formValues: TFormValues;

    constructor ( initialFormValues: TFormValues ) {
        this.formValues = initialFormValues;
    }

    setFieldValue = <TFieldName extends keyof TFormValues>(
        fieldName: TFieldName, newValue: TFormValues[TFieldName]
    ) => {
        this.formValues[ fieldName ] = newValue;
    };

    setValues = <TNewValues extends TFormValues>( newValues: TNewValues ) => {
        this.formValues = newValues;
    };

}
