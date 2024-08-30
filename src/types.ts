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
    , DeepPartial
    , DeepValue
    , EmptyObject
    , IntrinsicFormElements
    , MapNestedPrimitivesTo
    , NoInfer
    , Nullish
    , UnsubScribeFn
} from './utilityTypes';
import { CreateFormStoreParams } from './createFormStore';
import { FieldListProps } from './FieldList';

////// FORM GENERAL //////
export type FormValues = Record<PropertyKey, unknown> | null;
export type FormErrors<TFormValues extends FormValues> = MapNestedPrimitivesTo<TFormValues, string> | EmptyObject;
export type FormTouched<TFormValues extends FormValues> = MapNestedPrimitivesTo<TFormValues, boolean> | EmptyObject;
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
    ( values: TFormValues ) => Promise<DeepPartial<FormErrors<TFormValues>> | null> | DeepPartial<FormErrors<TFormValues>>;

export type SingleFieldValidator<
    TFormValues extends FormValues
    , TFieldName extends DeepKeys<TFormValues>
> = ( value: DeepValue<TFormValues, TFieldName> ) => Promise<string | Nullish> | string | Nullish;

/**
 * @param shouldValidate
 * Whether to run validation after field value is updated or the field is blurred.
 * Setting this prop to `false` will cancel any validation set for the field.
 * Granular configuration of the field validation can be set with the `validationEvent`
 * prop if set to `true` or not set.
 *
 * @default true
 * -----------------------
 * @param validationEvent
 * The field events for which validation should occur. *Only applies if
 * `shouldValidate` is set to `true` or not set at all.*
 *
 * Not setting this prop or setting this prop to `'all'` will run validation on every field
 * change or blur event.
 *
 * @default 'all'
 */
export type FieldValidationOptions = {
    shouldValidate?: true;
    validationEvent?: 'onChange' | 'onBlur' | 'all';
} | {
    shouldValidate: false;
    validationEvent?: never;
};

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
    setFieldValue: <
        TFieldName extends DeepKeys<TFormValues> = DeepKeys<TFormValues>
        , TFieldValue extends DeepValue<TFormValues, TFieldName> = DeepValue<TFormValues, TFieldName>
        , TFieldValidationOptions extends FieldValidationOptions = FieldValidationOptions
    >(
        fieldName: TFieldName
        , newValue: TFieldValue
        , options?: TFieldValidationOptions
    ) => void;
    /**
     * Set the values of any number of fields simultaneously
     */
    setValues: ( newValues: DeepPartial<TFormValues> ) => void;
    /**
     * Set the error message of a single field
     */
    setFieldError: ( fieldName: DeepKeys<TFormValues>, newError: string ) => void;
    /**
     * Set the error messages of any number of fields simultaneously
     */
    setErrors: ( newErrors: DeepPartial<FormErrors<TFormValues>> ) => void;
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
    handleChange: (
        e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
        , fieldValidationOptions?: FieldValidationOptions
    ) => void;
    /**
     * Helper method to handle the updating of a field's touched status by
     * taking the event emitted from onBlur and setting the
     * field's touched status accordingly
     */
    handleBlur: (
        e: FocusEvent<HTMLInputElement | HTMLSelectElement>
        , fieldValidationOptions?: FieldValidationOptions
    ) => void;
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
    resetForm: ( newFormValues?: DeepPartial<TFormValues> ) => void;
    /**
     * Helper method for handling form reset
     */
    handleReset: ( e: FormEvent<HTMLFormElement> ) => void;
    /**
     * Helper method or explicitly calling validation on the entire form.
     * For validating certain fields, use `validateField` instead.
     * **Please note that you must `await` any calls to `validateForm` in
     * order for the the form to properly update, as this method can handle
     * asynchronous operations**
     *
     * @param options a set of options to configure the validation call
     */
    validateForm: (
        options?: {
            /**
             * An option to use for extending the manual validation by also touching all fields.
             * This ensures that calling `validateForm` also shows all of the field errors on
             * the screen as the fields have also been touched. This is the equivalent to what
             * is done when validating during `onSubmit`.
             *
             * @default true
             */
            shouldTouchAllFields?: boolean;
        }
    ) => Promise<FormErrors<TFormValues>> | FormErrors<TFormValues>;
    /**
     * Helper method for validating a single field. **The field to be validated must have
     * a validator set as via the `validator` prop on the `<Field />` or pass an optional `validator`
     * to the options object (second argument) of `validateField`. **Please note that you must `await`
     * any calls to `validateField` in order for the the form to properly update, as this method can handle
     * asynchronous operations**
     *
     * @param fieldName the name of the field to validate
     * @param validator an optional validator to use for validation in the case a validator is not provided via props
     * @param shouldTouchField whether to touch the field or not after validation (defaults to `true`)
     */
    validateField: <TFieldName extends DeepKeys<TFormValues>>(
        fieldName: TFieldName
        , options?: {
            validator?: SingleFieldValidator<TFormValues, TFieldName>;
            shouldTouchField?: boolean;
        }
    ) => Promise<string | null> | string | null;
};

export type SubmissionOrResetHelpers<TFormValues extends FormValues> =
    Omit<
        FormHandlers<TFormValues>
        , 'handleReset'
        | 'handleSubmit'
        | 'submitForm'
        | 'handleBlur'
        | 'handleChange'
        | 'validateForm'
        | 'validateField'
    >;

export type OnSubmitOrReset<TFormValues extends FormValues> =
    (
        formValues: TFormValues
        , submitOrResetHelpers: SubmissionOrResetHelpers<TFormValues>
    ) => void | Promise<void>;

////// COMPUTED PROPS //////
export type FormComputedProps<TFormValues extends FormValues> = {
    /**
     * Returns true if any field in the form is dirty (the field value
     * is not exactly the same as it was in the initialValues)
     */
    isDirty: boolean;
    /**
     * An array of the names of all fields that are dirty
     */
    dirtyFields: DirtyFields<TFormValues>;
    /**
     * Returns true if all fields in the form are pristine (every value in the form
     * matches the initialValues)
     */
    isPristine: boolean;
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

////// FIELD EFFECTS //////
export type FieldEffectsConfig<
    TFormValues extends FormValues = FormValues,
    TFieldName extends DeepKeys<TFormValues> = DeepKeys<TFormValues>
> = {
    [Val in Exclude<DeepKeys<TFormValues>, TFieldName>]?: {
        [K in 'onChange' | 'onBlur']?: FieldEffectFn<TFormValues, TFieldName>;
    }
};

export type FieldEffectFn<
    TFormValues extends FormValues = FormValues
    , TFieldName extends DeepKeys<TFormValues> = DeepKeys<TFormValues>
> = (
        val: DeepValue<TFormValues, TFieldName>
        , helpers: FieldEffectHelpers<TFormValues>
    ) => void;

export type FieldEffectHelpers<TFormValues extends FormValues = FormValues> = Pick<
    FormHandlers<TFormValues>
    , 'validateField'
    | 'setFieldValue'
    | 'setFieldError'
    | 'setFieldTouched'
>;

////// FORMULARITY PROPS //////
export type FormularityProps<TFormValues extends FormValues = FormValues> =
FormStoreState<TFormValues>
& FieldRegistration<TFormValues>
& FormHandlers<TFormValues>
& FormComputedProps<TFormValues>
& FormularityComponents<TFormValues>;

////// COMPONENTS //////
export type FormularityComponents<TFormValues extends FormValues> = {
    /**
     * The `<Field />` component is the main component for hooking up inputs and
     * sections of forms in Formularity. It drastically reduces the amount of
     * boilerplate code needed to manage the state of a form field by taking care of
     * many basic actions such as handling change, blur, and showing errors. **Must
     * be used underneath a `<Formularity />` component.**
     */
    Field: FieldComponent<TFormValues>;
    /**
     * `<FieldList />` is a component that helps you
     * render out multiple fields in an array-like (list) fashion
     * to help manage values in the form that are grouped together.
     * @example
     *
     * ```jsx
     * <FieldList
            name='hobbies'
            render={ ( hobbies, {
                addField
            } ) => {
                return (
                    <>
                        <label>Hobbies</label>
                        {
                            hobbies.map( ( _, idx ) => (
                                <Field
                                    key={ idx }
                                    name={ `hobbies[${ idx }]` }
                                    showErrors
                                />
                            ) )
                        }
                        <button
                            onClick={ () => addField( '' ) }
                            type='button'
                        >
                            Add Hobby
                        </button>
                    </>
                );
            } }
        />
    * ```
    */
    FieldList: FieldListComponent<TFormValues>;
    /**
     * This component is an abstraction of the `<button type='submit' />` pattern in forms,
     * as well as a simple way to set common submit disabling logic on the form.
     * Use this component to reduce submit button boilerplate code and ensure proper
     * submitting of the form.
     */
    SubmitButton: SubmitButtonComponent;
    /**
     * This component is an abstraction of the `<button type='reset' />` pattern in forms.
     * Use this component to reduce reset button boilerplate code and ensure proper
     * resetting of the form.
     */
    ResetButton: ResetButtonComponent;
};

export type FieldComponent<TFormValues extends FormValues>
    = <
        TFieldName extends DeepKeys<TFormValues>
        , TComponentProps = keyof IntrinsicFormElements
        , TShowErrors extends boolean = false
        , TLabel extends string | undefined = undefined
        , TFieldValue extends DeepValue<TFormValues, TFieldName> = DeepValue<TFormValues, TFieldName>
        , TShouldValidate extends boolean = boolean
    >(
        props: FieldProps<
                TFormValues
                , TFieldName
                , TComponentProps
                , TShowErrors
                , TLabel
                , TFieldValue
                , TShouldValidate
            >
    ) => ReactNode;

export type FieldListComponent<TFormValues extends FormValues>
    = <
        TFieldName extends DeepKeys<TFormValues>
        , TFieldData extends DeepValue<TFormValues, TFieldName>
    >(
        props: FieldListProps<
            TFormValues
            , TFieldName
            , TFieldData
        >
    ) => ReactNode;

export type SubmitButtonComponent = typeof SubmitButton;
export type ResetButtonComponent = typeof ResetButton;
