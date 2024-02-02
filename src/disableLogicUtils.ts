// Types
import {
    FormComputedProps
    , FormStoreState
    , FormValues
} from './types';

export const disableAfterFirstSubmitUnlessEditing = <TFormValues extends FormValues>(
    submitCount: FormStoreState<TFormValues>['submitCount']
    , isValid: FormComputedProps<TFormValues>['isValid']
    , dirty: FormComputedProps<TFormValues>['isDirty']
    , isEditing?: FormStoreState<TFormValues>['isEditing']
) => {
    return submitCount > 0
        ? !isValid
        : isEditing
            ? !dirty
            : false;
};

export const isFormDisabled = <TFormValues extends FormValues>(
    isValid: FormComputedProps<TFormValues>['isValid']
    , dirty: FormComputedProps<TFormValues>['isDirty']
) => {
    return !( isValid && dirty );
};
