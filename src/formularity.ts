import { ChangeEvent } from 'react';
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
        , updater
    }: FormularityConstructorFunctionArgs<TFormValues> ) {
        this.initialFormValues = { ...initialFormValues };
        this.formValues = initialFormValues;
        this.onSubmit = onSubmit;
        this.errors = {} as FormErrors<TFormValues>;
        this.updaterCallback = updater;
    }

    // For handling triggering rerenders
    private updaterCallback: () => void;
    private triggerUpdate = () => {
        this.updaterCallback();
    };

    /**
     *
     * @description Set the value of a single field
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
    };

    handleChange = <TElement extends HTMLElement>( e: ChangeEvent<TElement> ) => {
        const {
            name
            , value
        } = e.target;

        this.setFieldValue( name, value as TFormValues[keyof TFormValues] );
        this.triggerUpdate();
    };

    handleSubmit = async () => {
        this.isSubmitting = true;
        this.updateSubmitCount();

        await this.onSubmit( this.formValues, this );

        this.isSubmitting = false;
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
