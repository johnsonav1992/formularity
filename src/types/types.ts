export type FormValues = Record<PropertyKey, unknown>;
export type SubmitHandler<TFormValues extends FormValues> = ( values: TFormValues ) => void;

export type FormularityConstructorFunctionArgs<TFormValues extends FormValues> = {
    initialFormValues: TFormValues
    ; onSubmit: SubmitHandler<TFormValues>;
};
