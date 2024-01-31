// Types
import {
    FormComputedProps
    , FormStoreState
    , FormValues
} from './types/types';

export const disableAfterFirstSubmitUnlessEditing = <TFormValues extends FormValues>(
    submitCount: FormStoreState<TFormValues>['submitCount']
    , isValid: FormComputedProps<TFormValues>['isValid']
    , dirty: FormStoreState<TFormValues>['dirty']
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
    , dirty: FormStoreState<TFormValues>['dirty']
) => {
    return !( isValid && dirty );
};
