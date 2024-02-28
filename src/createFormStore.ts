// Types
import {
    FormStore
    , FormStoreState
    , FormValues
    , ValidationHandler
} from './types';

import {
    NoInfer
    , Subscriber
} from './utilityTypes';

// Utils
import { cloneDeep } from './utils';

export type CreateFormStoreParams<TFormValues extends FormValues> = {
    /**
     * The initial values of the form
     */
    initialValues: TFormValues;
    /**
     * A function that takes the current form values and returns a manually
     * populated errors object in the shape of FormErrors
     */
    manualValidationHandler?: ValidationHandler<NoInfer<TFormValues>>;
    /**
     * A custom input for a validation schema from a third-party library
     * Must be wrapped in a provided or a custom-built adapter
     */
    validationSchema?: ValidationHandler<NoInfer<TFormValues>>;
    /**
     * Optional location for putting a submit handler. This is uncommon
     * and it is preferred that the submit handler be passed as a prop to
     * ```<Formularity />```. This should only be used if submission must occur
     * from outside the ```Formularity``` instance. ***This ```onSubmit``` will take
     * precedence over onSubmit passed as a prop.***
     */
    onSubmit?: ( formValues: TFormValues ) => void | Promise<void>;
};

export const createFormStore = <TFormValues extends FormValues>( formStoreParams: CreateFormStoreParams<TFormValues> ): FormStore<TFormValues> => {
    let storeState = {
        ...getDefaultFormStoreState( formStoreParams.initialValues )
        , manualValidationHandler: formStoreParams.manualValidationHandler
        , validationSchema: formStoreParams.validationSchema
        , onSubmit: formStoreParams.onSubmit
    };

    const subscribers = new Set<Subscriber>();

    return {
        get: () => storeState
        , set: ( newStoreState: Partial<FormStoreState<TFormValues>> ) => {
            storeState = {
                ...storeState
                , ...newStoreState
            };

            subscribers.forEach( callback => callback() );
        }
        , subscribe: callback => {
            subscribers.add( callback );

            return () => {
                subscribers.delete( callback );
            };
        }
    };
};

export const getDefaultFormStoreState = <TFormValues extends FormValues>( initialValues: TFormValues ) => {
    const defaultStoreState: FormStoreState<TFormValues> = {
        values: cloneDeep( initialValues )
        , initialValues
        , errors: {}
        , touched: {}
        , isSubmitting: false
        , isValidating: false
        , submitCount: 0
        , isEditing: false
    };

    return defaultStoreState;
};
