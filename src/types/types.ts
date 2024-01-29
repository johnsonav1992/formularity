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
    /**
     * The initial form values provided by the user at the
     * time of form store creation.
     */
    initialValues: TFormValues;
    /**
     * The current state of the values of the form
     */
    values: TFormValues;
    /**
     * The current state of the errors of the form
     */
    errors: FormErrors<TFormValues>;
    /**
     * The currently touched fields of the form
     */
    touched: FormTouched<TFormValues>;
    /**
     * Current submitting status of the form
     */
    isSubmitting: boolean;
    /**
     * This returns true if the intial values of the form
     * do not match the current values. This essentially
     * means that the form has been partially completed,
     * thus it is considered "dirty"
     */
    dirty: boolean;
    /**
     * This returns true if the form is currently in a valid state;
     * There are no errors present.
     */
    isValid: boolean;
    /**
     * This returns true if the form is currently validating (running validation).
     */
    isValidating: boolean;
    /**
     * The number of times the form has been submitted since it
     * has been mounted in the DOM
     */
    submitCount: number;
    /**
     * Whether the form is being used in an editing state.
     * This is a custom filed that is provided by the user at the time
     * of initializing the form based on the logic of their application.
     */
    isEditing: boolean;
};

export type Formularity<TFormValues extends FormValues> = {
    values: TFormValues;
    errors: FormErrors<TFormValues>;
    setFormValues: ( newValues: TFormValues ) => void;
    setFormErrors: ( newErrors: FormErrors<TFormValues> ) => void;
};

export type DirtyFields<TFormValues extends FormValues> = Array<keyof NonNullable<TFormValues>>;
