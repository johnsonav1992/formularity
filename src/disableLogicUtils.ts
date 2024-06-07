// Types
import { FormularityProps } from './types';

/**
 * Allow the user to submit once, and if errors
 * exist after that first submission, disable.
 */
export const disableAfterFirstSubmit = ( {
    submitCount
    , isValid
}: FormularityProps ) => {
    return submitCount > 0
        ? !isValid
        : false;
};

/**
 * Allow the user to submit once, and if errors
 * exist after that first submission, disable, unless
 * editing mode as been turned on.
 */
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

/**
 * Disable the form if it is not valid and not dirty.
 */
export const isFormDisabledNotDirty = ( {
    isValid
    , isDirty
}: FormularityProps ) => {
    return !( isValid && isDirty );
};
