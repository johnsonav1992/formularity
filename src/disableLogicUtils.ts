/////// DISABLE LOGIC HELPERS ///////

import {
    FormStoreState
    , FormValues
} from './types/types';

export const isCreateOrEditFormDisabled = <TFormValues extends FormValues>(
    submitCount: FormStoreState<TFormValues>['submitCount']
    , isValid: FormStoreState<TFormValues>['isValid']
    , dirty: FormStoreState<TFormValues>['dirty']
    , isEditing: FormStoreState<TFormValues>['isEditing']
) => {
    return submitCount > 0
        ? !isValid
        : isEditing
            ? !dirty
            : false;
};

export const isFormDisabled = <TFormValues extends FormValues>(
    isValid: FormStoreState<TFormValues>['isValid']
    , dirty: FormStoreState<TFormValues>['dirty']
) => {
    return !( isValid && dirty );
};
