import {
    ChangeEvent
    , FocusEvent
    , FormEvent
    , ReactNode
} from 'react';

// Components
import { FieldProps } from './Field';
import { SubmitButton } from './SubmitButton';

// Types
import {
    DeepKeys
    , DeepValue
    , EmptyObject
    , UnsubScribeFn
} from './utilityTypes';

////// FORM GENERAL //////
export type FormValues = Record<PropertyKey, unknown> | null;
export type FormErrors<TFormValues extends FormValues> = Record<keyof TFormValues, string> | EmptyObject;
export type FormTouched<TFormValues extends FormValues> = Record<keyof TFormValues, boolean> | EmptyObject;

export type DirtyFields<TFormValues extends FormValues> = Array<keyof NonNullable<TFormValues>>;

////// VALIDATION //////
export type ValidationHandler<TFormValues extends FormValues> =
    ( values: TFormValues ) => Promise<Partial<FormErrors<TFormValues>> | null> | Partial<FormErrors<TFormValues>>;

////// STORE //////
export type FormStore<TFormValues extends FormValues> = {
    get: () => FormStoreState<TFormValues>;
    set: ( newFormStore: Partial<FormStoreState<TFormValues>> ) => void;
    subscribe: ( callback: () => void ) => UnsubScribeFn;
};

////// FORM STATE //////
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
     * The current errors in the form. *Note that only fields with validation
     * logic attached to them (whether through field or form-level validation)
     * can ever have errors populate in this object.*
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
     * This is a custom field that is provided by the user at the time
     * of initializing the form based on the logic of their application.
     */
    isEditing: boolean;
};

////// HANDLERS //////
export type FormHandlers<TFormValues extends FormValues> = {
    /**
     * Set the value of a single field
     */
    setFieldValue: ( fieldName: DeepKeys<TFormValues>, newValue: TFormValues[keyof TFormValues] ) => void;
    /**
     * Set the values of any number of fields simultaneously
     */
    setValues: ( newValues: TFormValues ) => void;
    /**
     * Set the error message of a single field
     */
    setFieldError: ( fieldName: DeepKeys<TFormValues>, newError: string ) => void;
    /**
     * Set the error messages of any number of fields simultaneously
     */
    setErrors: ( newErrors: FormErrors<TFormValues> ) => void;
    /**
     * Set the touched status of a single field
     */
    setFieldTouched: ( fieldName: DeepKeys<TFormValues>, newTouched: boolean ) => void;
    /**
     * Set the touched statuses of any number of fields simultaneously
     */
    setTouched: ( newTouched: FormTouched<TFormValues> ) => void;
    /**
     * Helper method to handle the updating of a field's value by
     * taking the event emitted from onChange and setting the
     * field's value accordingly
     */
    handleChange: ( e: ChangeEvent<HTMLInputElement | HTMLSelectElement> ) => void;
    /**
     * Helper method to handle the updating of a field's touched status by
     * taking the event emitted from onBlur and setting the
     * field's touched status accordingly
     */
    handleBlur: ( e: FocusEvent<HTMLInputElement | HTMLSelectElement> ) => void;
    /**
     * Helper method for submitting the form imperatively
     */
    submitForm: () => Promise<void>;
    /**
     * Helper method for handling form submission
     */
    handleSubmit: ( e: FormEvent<HTMLFormElement> ) => void | Promise<void>;
    /**
     * Reset the form imperatively and optional set all or some of the
     * form values to new values(s)
     */
    resetForm: ( newFormValues?: Partial<TFormValues> ) => void;
    /**
     * Helper method for handling form reset
     */
    handleReset: ( e: FormEvent<HTMLFormElement> ) => void;
};

////// COMPUTED PROPS //////
export type FormComputedProps<TFormValues extends FormValues> = {
    /**
     * Returns true if any field in the form is dirty
     */
    isDirty: boolean;
    /**
     * An array of the names of all fields that are dirty
     */
    dirtyFields: DirtyFields<TFormValues>;
    /**
     * This returns true if the form is currently in a valid state;
     * There are no errors present.
     */
    isValid: boolean;
    /**
     * Returns true if any field in the form is touched
     */
    isFormTouched: boolean;
};

////// FORMULARITY PROPS //////
export type FormularityProps<TFormValues extends FormValues = FormValues> =
    FormStoreState<TFormValues>
    & FormHandlers<TFormValues>
    & FormComputedProps<TFormValues>;

////// COMPONENTS //////
export type FieldComponent<TFormValues extends FormValues>
    = <
        TFieldName extends DeepKeys<TFormValues>
        , TComponentProps = {}
        , TShowErrors extends boolean = false
        , TFieldValue extends DeepValue<TFormValues, TFieldName> = DeepValue<TFormValues, TFieldName>
    >(
        props: FieldProps<TFormValues, TFieldName, TComponentProps, TShowErrors, TFieldValue>
    ) => ReactNode;

export type SubmitButtonComponent = typeof SubmitButton;
