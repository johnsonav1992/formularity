import {
    FormValues
    , FormularityConstructorFunctionArgs
    , SubmitHandler
} from './types/types';

export class Formularity<TFormValues extends FormValues> {
    public formValues: TFormValues;
    public submitCount: number = 0;
    public onSubmit: SubmitHandler<TFormValues>;

    constructor ( {
        initialFormValues
        , onSubmit
    }: FormularityConstructorFunctionArgs<TFormValues> ) {
        this.formValues = initialFormValues;
        this.onSubmit = onSubmit;
    }

    setFieldValue = <TFieldName extends keyof TFormValues>(
        fieldName: TFieldName, newValue: TFormValues[TFieldName]
    ) => {
        this.formValues[ fieldName ] = newValue;
    };

    setValues = <TNewValues extends TFormValues>( newValues: TNewValues ) => {
        this.formValues = newValues;
    };

    updateSubmitCount = () => {
        this.submitCount += 1;
    };

}

const form = new Formularity( {
    initialFormValues: { name: '' }
    , onSubmit: () => {}
} );
