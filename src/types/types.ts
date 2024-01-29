export type FormValues = Record<PropertyKey, unknown> | null;
export type FormErrors<TFormValues extends FormValues> = Record<keyof TFormValues, string> | EmptyObject;
export type FormTouched<TFormValues extends FormValues> = Record<keyof TFormValues, boolean> | EmptyObject;

export type EmptyObject = Record<string, never>;
export type UnsubScribeFn = () => void;

export type FormStore<TFormValues extends FormValues> = {
    get: () => FormStoreState<TFormValues>;
    set: ( newFormStore: FormStoreState<TFormValues> ) => void;
    subscribe: ( callback: ( newFormStore: FormStoreState<TFormValues> ) => void ) => UnsubScribeFn;
};

export type FormStoreState<TFormValues extends FormValues> = {
    values: TFormValues;
    errors: FormErrors<TFormValues>;
    touched: FormTouched<TFormValues>;
    isSubmitting: boolean;
    dirty: boolean;
    isValid: boolean;
    isValidating: boolean;
    submitCount: number;
};

export type Formularity<TFormValues extends FormValues> = {
    values: TFormValues;
    errors: FormErrors<TFormValues>;
    setFormValues: ( newValues: TFormValues ) => void;
    setFormErrors: ( newErrors: FormErrors<TFormValues> ) => void;
};

export type DirtyFields<TFormValues extends FormValues> = Array<keyof NonNullable<TFormValues>>;
