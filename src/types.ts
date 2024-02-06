import {
    ChangeEvent
    , FocusEvent
    , FormEvent
    , ReactNode
} from 'react';
import { FieldProps } from './Field';

export type Prettify<T> = {
    [K in keyof T]: T[K];
} & {};

export type FormValues = Record<PropertyKey, unknown> | null;
export type FormErrors<TFormValues extends FormValues> = Record<keyof TFormValues, string> | EmptyObject;
export type FormTouched<TFormValues extends FormValues> = Record<keyof TFormValues, boolean> | EmptyObject;

export type DirtyFields<TFormValues extends FormValues> = Array<keyof NonNullable<TFormValues>>;

export type EmptyObject = Record<string, never>;
export type UnsubScribeFn = () => void;

export type ManualValidationHandler<TFormValues extends FormValues> =
    ( values: TFormValues ) => Partial<FormErrors<TFormValues>>;

export type FormStore<TFormValues extends FormValues> = {
    get: () => FormStoreState<TFormValues>;
    set: ( newFormStore: Partial<FormStoreState<TFormValues>> ) => void;
    subscribe: ( callback: () => void ) => UnsubScribeFn;
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

export type FormHandlers<TFormValues extends FormValues> = {
    /**
     * Set the value of a single field
     */
    setFieldValue: ( fieldName: keyof TFormValues, newValue: TFormValues[keyof TFormValues] ) => void;
    /**
     * Set the values of any number of fields simultaneously
     */
    setValues: ( newValues: TFormValues ) => void;
    /**
     * Set the error message of a single field
     */
    setFieldError: ( fieldName: keyof TFormValues, newError: string ) => void;
    /**
     * Set the error messages of any number of fields simultaneously
     */
    setErrors: ( newErrors: FormErrors<TFormValues> ) => void;
    /**
     * Set the touched status of a single field
     */
    setFieldTouched: ( fieldName: keyof TFormValues, newTouched: boolean ) => void;
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
     * Helper method for handling form submission
     */
    handleSubmit: ( e: FormEvent<HTMLFormElement> ) => void | Promise<void>;
    /**
     * Helper method for handling form reset
     */
    handleReset: ( e: FormEvent<HTMLFormElement> ) => void;
    /**
     * Reset the form imperatively and optional set all or some of the
     * form values to new values(s)
     */
    resetForm: ( newFormValues?: Partial<TFormValues> ) => void;
};

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

export type FormularityProps<TFormValues extends FormValues = FormValues> =
    FormStoreState<TFormValues>
    & FormHandlers<TFormValues>
    & FormComputedProps<TFormValues>;

export type FieldComponent<TFormValues extends FormValues>
    = <TFieldValue extends DeepKeys<TFormValues>>(
        props: FieldProps<TFormValues, TFieldValue>
    ) => ReactNode;

type Keys<O, IsTop, K extends string | number> =
    IsTop extends true
        ? K | ( O extends unknown[] ? `[${ K }]` : never )
        : `.${ K }` | ( O extends unknown[] ? `[${ K }]` | `.[${ K }]` : never );

export type DeepKeys<T, IsTop = true, K extends keyof T = keyof T> =
    K extends string | number
        ? `${ Keys<T, IsTop, K> }${ '' | ( T[K] extends object ? DeepKeys<T[K], false> : '' ) }`
        : never;

export type DeepValue<TObj, TKey> = TObj extends Record<PropertyKey, unknown>
    ? TKey extends `${ infer TBranch }.${ infer TDeepKey }`
        ? DeepValue<TObj[TBranch], TDeepKey>
        : TObj[TKey & keyof TObj]
    : never;

type obj = {
    one: {
        two: [
            'something'
        ];
    };
};

type access<TFieldName extends DeepKeys<obj>> = DeepValue<obj, TFieldName>;

type actualtest = access<'one.two.0'>;
