import { InitialFormValues } from './types/types';

export class Formularity<TInitValues extends InitialFormValues> {
    initialFormValues: TInitValues;

    constructor ( initialFormValues: TInitValues ) {
        this.initialFormValues = initialFormValues;
    }

    setFieldValue = <TFieldName extends keyof TInitValues>(
        fieldName: TFieldName, newValue: TInitValues[TFieldName]
    ) => {
        this.initialFormValues[ fieldName ] = newValue;
    };

}
