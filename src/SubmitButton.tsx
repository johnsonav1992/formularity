import React, {
    ComponentProps
    , FC
    , ReactNode
} from 'react';
import { NoInfer } from './utilityTypes';
import { useFormularityContext } from './Formularity';
import {
    disableAfterFirstSubmit
    , disableAfterFirstSubmitUnlessEditing
    , isFormDisabledNotDirty
} from './disableLogicUtils';

export type SubmitButtonProps<
    TDisableInvalid extends boolean
    , TComponentProps = {}
> = {
        /**
         * Component to be rendered. Must be a custom component that ultimately
         * renders an HTML button in order to work properly.
         */
        component?: FC<TComponentProps>;
        /**
         * Disable the button if any errors exist in the form
         * @default true
         */
        disableInvalid?: TDisableInvalid;
        /**
         * Method for determining when the submit button should be disabled
         *
         * *note - All options assume the form is invalid at the time of rendering
         * the disabled state (errors exist in the form)
         * Options:
         *
         * 1. `'after-first-submission'`: Disables the button only after submitting once and errors still exist
         * 2. `'after-first-submission-editing'`: Disables the button only after submitting once unless in editing state
         * 3. `'if-not-dirty'`: Checks to see if the form is also dirty and will disable if no changes have been made to the form
         * 4. `'errors-only'`: Will disable the form regardless of any criteria other than presence of errors
         */
        disabledMode?: NoInfer<TDisableInvalid> extends true
            ? 'after-first-submission'
                | 'after-first-submission-editing'
                | 'if-not-dirty'
                | 'errors-only'
            : never;
    } & ( NoInfer<TComponentProps> extends undefined
            ? Omit<ComponentProps<'button'>, 'type' | 'children'>
                : Omit<NoInfer<TComponentProps>, 'type' | 'children'>
    ) & { children?: ReactNode };

export const SubmitButton = <
    TDisableInvalid extends boolean
    , TComponentProps
>( {
        component
        , disableInvalid
        , disabledMode
        , children
        , ...props
    }: SubmitButtonProps<TDisableInvalid, TComponentProps> ) => {
    const formularityCtx = useFormularityContext();

    const renderedComponent = ( component as unknown as FC ) || 'button';

    const getDisabledLogic = () => {
        const isValid = !!formularityCtx.isValid;

        if ( 'disabled' in props && props.disabled ) return props.disabled;
        if ( disableInvalid == null ) return !isValid;

        if ( disableInvalid ) {
            switch ( disabledMode ) {
                case 'after-first-submission':
                    return disableAfterFirstSubmit( formularityCtx );
                case 'after-first-submission-editing':
                    return disableAfterFirstSubmitUnlessEditing( formularityCtx );
                case 'if-not-dirty':
                    return isFormDisabledNotDirty( formularityCtx );
                case 'errors-only':
                    return !isValid;
                default:
                    return !isValid;
            }
        }
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
