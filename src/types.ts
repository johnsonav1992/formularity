import {
    ChangeEvent
    , FocusEvent
    , FormEvent
    , ReactNode
} from 'react';

// Components
import { FieldProps } from './Field';
import { SubmitButton } from './SubmitButton';
import { ResetButton } from './ResetButton';

// Types
import {
    DeepKeys
    , DeepValue
    , EmptyObject
    , IntrinsicFormElements
    , NoInfer
    , Nullish
    , UnsubScribeFn
} from './utilityTypes';
import { CreateFormStoreParams } from './createFormStore';

////// FORM GENERAL //////
export type FormValues = Record<PropertyKey, unknown> | null;

export type FormErrors<TFormValues extends FormValues> = {
    [K in keyof TFormValues]?: TFormValues[K] extends Array<infer U>
        ? Array<U extends object
            ? U extends FormValues
                ? FormErrors<U>
                : never
            : U extends number | boolean | string
                ? string
                : never>
        : TFormValues[K] extends object
            ? TFormValues[K] extends FormValues
                ? FormErrors<TFormValues[K]>
                : never
            : string;
} | EmptyObject;

export type FormTouched<TFormValues extends FormValues> = {
    [K in keyof TFormValues]?: TFormValues[K] extends Array<infer U>
        ? Array<U extends object
            ? U extends FormValues
                ? FormTouched<U>
                : never
            : U extends number | boolean | string
                ? boolean
                : never>
        : TFormValues[K] extends object
            ? TFormValues[K] extends FormValues
                ? FormTouched<TFormValues[K]>
                : never
            : boolean;
} | EmptyObject;

export type DirtyFields<TFormValues extends FormValues> = Array<DeepKeys<NonNullable<TFormValues>>>;

////// FIELD REGISTRATION //////
export type FieldRegistry<TFormValues extends FormValues> =
    Record<DeepKeys<TFormValues>, NewFieldRegistration<TFormValues> | null>
    | EmptyObject;

export type NewFieldRegistration<
    TFormValues extends FormValues
    , TFieldName extends DeepKeys<TFormValues> = DeepKeys<TFormValues>
> = {
    name: TFieldName;
    /**
     * single field validator that is passed to the field
     */
    validationHandler: SingleFieldValidator<TFormValues, NoInfer<TFieldName>> | null;
    /**
     * Any ID that may be passed to the field
     */
    fieldId?: string | number;
    /**
     * type of the field for registration purposes (parent can have access)
     */
    type?: string;
};

export type FieldRegistration<TFormValues extends FormValues = FormValues> = {
    /**
     * Function for adding a field to the registry
     */
    registerField: <TFieldName extends DeepKeys<TFormValues>>(
        newFieldRegistration: NewFieldRegistration<TFormValues, TFieldName>
    ) => void;
    /**
     * Function for removing a field from the registry
     */
    unregisterField: <TFieldName extends DeepKeys<TFormValues>>( fieldName: TFieldName ) => void;
};

////// VALIDATION //////
export type ValidationHandler<TFormValues extends FormValues> =
    ( values: TFormValues ) => Promise<Partial<FormErrors<TFormValues>> | null> | Partial<FormErrors<TFormValues>>;

export type SingleFieldValidator<
    TFormValues extends FormValues
    , TFieldName extends DeepKeys<TFormValues> = DeepKeys<TFormValues>
> = ( value: DeepValue<TFormValues, TFieldName> ) => Promise<string | Nullish> | string | Nullish;

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
    /**
     * Manual validation handler passed to the form store instance
     */
    manualValidationHandler?: CreateFormStoreParams<TFormValues>['manualValidationHandler'];
    /**
     * Validation schema passed to the form store instance
     */
    validationSchema?: CreateFormStoreParams<TFormValues>['validationSchema'];
    /**
     * Optional top-level submit handler *See ```CreateFormStoreParams``` type for full
     * description/usage
     */
    onSubmit?: ( formValues: TFormValues ) => void | Promise<void>;
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
    /**
     * Returns `true` if every field (all nested fields included) are touched
     */
    areAllFieldsTouched: boolean;
};

////// FORMULARITY PROPS //////
export type FormularityProps<TFormValues extends FormValues = FormValues> =
    FormStoreState<TFormValues>
    & FieldRegistration<TFormValues>
    & FormHandlers<TFormValues>
    & FormComputedProps<TFormValues>;

////// COMPONENTS //////
export type FieldComponent<TFormValues extends FormValues>
    = <
        TFieldName extends DeepKeys<TFormValues>
        , TComponentProps = keyof IntrinsicFormElements
        , TShowErrors extends boolean = false
        , TFieldValue extends DeepValue<TFormValues, TFieldName> = DeepValue<TFormValues, TFieldName>
    >(
        props: FieldProps<TFormValues, TFieldName, TComponentProps, TShowErrors, TFieldValue>
    ) => ReactNode;

export type SubmitButtonComponent = typeof SubmitButton;
export type ResetButtonComponent = typeof ResetButton;
