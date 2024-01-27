export type FormValues = Record<PropertyKey, unknown> | null;
export type FormErrors<TFormValues extends FormValues> = Record<keyof TFormValues, string> | Record<string, never>;

export type UnsubScribeFn = () => void;

export type FormStoreState<TFormValues extends FormValues> = { values: TFormValues; errors: FormErrors<TFormValues>};

export type FormStore<TFormValues extends FormValues> = {
    get: () => FormStoreState<TFormValues>;
    set: ( newFormStore: FormStoreState<TFormValues> ) => void;
    subscribe: ( callback: ( newFormStore: FormStoreState<TFormValues> ) => void ) => UnsubScribeFn;
};

export type Formularity<TFormValues extends FormValues> = {
    values: TFormValues;
    errors: FormErrors<TFormValues>;
    setFormValues: ( newValues: TFormValues ) => void;
    setFormErrors: ( newErrors: FormErrors<TFormValues> ) => void;
};

export type SubmitHandler<TFormValues extends FormValues> =
    ( values: TFormValues, formularity: Formularity<TFormValues> ) => void | Promise<void>;

export type FormularityConstructorFunctionArgs<TFormValues extends FormValues> = {
    initialFormValues: TFormValues;
    onSubmit: SubmitHandler<TFormValues>;
    updater: () => void;
};
