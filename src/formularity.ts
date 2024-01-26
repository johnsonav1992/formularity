import {
    FormErrors
    , FormValues
    , FormularityConstructorFunctionArgs
    , SubmitHandler
} from './types/types';

export class Formularity<TFormValues extends FormValues> {
    formValues: TFormValues;
    errors: FormErrors<TFormValues>;
    submitCount: number = 0;
    isSubmitting: boolean = false;
    onSubmit: SubmitHandler<TFormValues>;

    constructor ( {
        initialFormValues
        , onSubmit
    }: FormularityConstructorFunctionArgs<TFormValues> ) {
        this.formValues = initialFormValues;
        this.onSubmit = onSubmit;
        this.errors = {} as FormErrors<TFormValues>;
    }

    setFieldValue = <TFieldName extends keyof TFormValues>(
        fieldName: TFieldName
        , newValue: TFormValues[TFieldName]
    ) => {
        this.formValues[ fieldName ] = newValue;
    };

    setValues = <TNewValues extends TFormValues>( newValues: TNewValues ) => {
        this.formValues = newValues;
    };

    setFieldError = <TFieldName extends keyof TFormValues>(
        fieldName: TFieldName
        , newError: string
    ) => {
        this.errors[ fieldName ] = newError;
    };

    setErrors = <TNewErrors extends FormErrors<TFormValues>>( newErrors: TNewErrors ) => {
        this.errors = newErrors;
    };

    updateSubmitCount = () => {
        this.submitCount += 1;
    };

    handleSubmit = async () => {
        this.isSubmitting = true;
        this.updateSubmitCount();

        await this.onSubmit( this.formValues, this );

        this.isSubmitting = false;
    };
}

const form = new Formularity( {
    initialFormValues: { name: '' }
    , onSubmit: () => {}
} );
