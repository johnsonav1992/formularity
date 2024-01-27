import {
    ChangeEvent
    , FormEvent
} from 'react';
import {
    FormErrors
    , FormValues
    , FormularityConstructorFunctionArgs
    , SubmitHandler
} from './types/types';

export class Formularity<TFormValues extends FormValues> {
    formValues: TFormValues;
    initialFormValues: TFormValues;
    errors: FormErrors<TFormValues>;
    submitCount: number = 0;
    isSubmitting: boolean = false;
    onSubmit: SubmitHandler<TFormValues>;

    constructor ( {
        initialFormValues
        , onSubmit
    }: FormularityConstructorFunctionArgs<TFormValues> ) {
        this.initialFormValues = { ...initialFormValues };
        this.formValues = initialFormValues;
        this.onSubmit = onSubmit;
        this.errors = {} as FormErrors<TFormValues>;
    }

    // For handling triggering rerenders
    setUpdaterCallback = cb => {
        this.updaterCallback = cb;
    };
    private updaterCallback: () => void;
    private triggerUpdate = () => {
        this.updaterCallback();
    };

    /**
     *
     * Set the value of a single field
     * @param fieldName name of field to set
     * @param newValue new value of field
     *
     */
    setFieldValue = <TFieldName extends keyof TFormValues>(
        fieldName: TFieldName
        , newValue: TFormValues[TFieldName]
    ) => {
        this.formValues[ fieldName ] = newValue;
        this.triggerUpdate();
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
        this.triggerUpdate();
    };

    setSubmitting = ( isSubmitting: boolean ) => {
        this.isSubmitting = isSubmitting;
        this.triggerUpdate();
    };

    set submitting ( newState: boolean ) {
        this.isSubmitting = newState;
    }

    handleChange = <TElement>( e: ChangeEvent<TElement> ) => {
        const {
            name
            , value
        } = e.target;

        this.setFieldValue( name, value );
    };

    handleSubmit = async ( e: FormEvent<HTMLFormElement> ) => {
        e.persist();
        e.preventDefault();

        this.submitting = true;
        this.updateSubmitCount();

        await this.onSubmit( this.formValues, this );

        this.submitting = false;
        console.log( this );
    };

    resetForm = () => {
        this.formValues = this.initialFormValues;
        this.errors = {} as FormErrors<TFormValues>;
    };
}

// const form = new Formularity( {
//     initialFormValues: { name: '' }
//     , onSubmit: () => {}
// } );
