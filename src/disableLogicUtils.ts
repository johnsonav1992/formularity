// Types
import { FormularityProps } from './types';

export const disableAfterFirstSubmit = ( {
    submitCount
    , isValid
}: FormularityProps ) => {
    return submitCount > 0
        ? !isValid
        : false;
};

export const disableAfterFirstSubmitUnlessEditing = ( {
    submitCount
    , isValid
    , isDirty
    , isEditing
}: FormularityProps ) => {
    return submitCount > 0
        ? !isValid
        : isEditing
            ? !isDirty
            : false;
};

export const isFormDisabledNotDirty = ( {
    isValid
    , isDirty
}: FormularityProps ) => {
    return !( isValid && isDirty );
};
