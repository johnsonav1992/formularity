import React, {
    ComponentProps
    , FC
    , ReactNode
} from 'react';

// Types
import { NoInfer } from './utilityTypes';

// Context
import { useFormularityContext } from './Formularity';

// Utils
import {
    disableAfterFirstSubmit
    , disableAfterFirstSubmitUnlessEditing
    , isFormDisabledNotDirty
} from './disableLogicUtils';

export type SubmitButtonProps<
    TDisableInvalid extends boolean
    , TComponentProps = undefined
> = {
        /**
         * Child elements of the button
         */
        children?: ReactNode;
        /**
         * Component to be rendered. Must be a custom component that ultimately
         * renders an HTML button in order to work properly.
         */
        component?: FC<TComponentProps> | 'button';
        /**
         * Disable the button if any errors exist in the form
         * @default true
         */
        disableInvalid?: TDisableInvalid;
        /**
         * Method for determining when the submit button should be disabled
         *
         * *note - All options assume the form is invalid (contains errors) at
         * the time of rendering the disabled state
         *
         * Options:
         *
         * 1. `'after-first-submission'`: Disables the button only after one submission
         * 2. `'after-first-submission-editing'`: Disables the button only after one submission unless in editing state
         * 3. `'not-dirty'`: Checks to see if the form is also dirty and will disable if no changes have been made to the form
         * 4. `'errors-only'`: Will disable the form regardless of any criteria other than `isValid`
         *
         * @default 'errors-only'
         */
        disabledMode?: NoInfer<TDisableInvalid> extends true
            ? 'after-first-submission'
                | 'after-first-submission-editing'
                | 'not-dirty'
                | 'errors-only'
            : never;
        /**
         * Disable the button during form submission
         */
        disableWhileSubmitting?: boolean;
    }
    & (
        TComponentProps extends 'button' | undefined
            ? ComponentProps<'button'>
            : Omit<NoInfer<TComponentProps>, 'type' | 'children'>
    );

export const SubmitButton = <
        TDisableInvalid extends boolean
        , TComponentProps = undefined
    >(
        {
            component
            , disableInvalid
            , disabledMode
            , disableWhileSubmitting
            , children
            , ...props
        }: SubmitButtonProps<TDisableInvalid, TComponentProps>
    ) => {
    const formularityCtx = useFormularityContext();

    const renderedComponent = component as FC || 'button';

    const getDisabledLogic = () => {
        const isValid = !!formularityCtx.isValid;

        if ( 'disabled' in props && props.disabled ) return props.disabled;
        if ( disableInvalid == null ) return !isValid;
        if ( disableWhileSubmitting && formularityCtx.isSubmitting ) return true;

        if ( disableInvalid ) {
            switch ( disabledMode ) {
                case 'after-first-submission':
                    return disableAfterFirstSubmit( formularityCtx );
                case 'after-first-submission-editing':
                    return disableAfterFirstSubmitUnlessEditing( formularityCtx );
                case 'not-dirty':
                    return isFormDisabledNotDirty( formularityCtx );
                case 'errors-only':
                default:
                    return !isValid;
            }
        }

        return false;
    };

    const submitButtonProps = {
        type: 'submit'
        , disabled: getDisabledLogic()
        , ... props
    };

    return React.createElement<typeof submitButtonProps>(
        renderedComponent
        , submitButtonProps
        , children
    );
};
