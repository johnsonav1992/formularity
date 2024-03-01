import React, {
    ComponentProps
    , FC
    , ReactNode
} from 'react';

export type SubmitButtonProps<TComponentProps extends Record<string, unknown> = {}> =
    ComponentProps<'button'>
    & { component?: ReactNode }
    & TComponentProps;

export const SubmitButton = <TComponentProps extends Record<string, unknown> = {}>( {
    component
    , children
    , ...props
}: SubmitButtonProps<TComponentProps> ) => {
    const renderedComponent = ( component as unknown as FC ) || 'button';

    const submitButtonProps = {
        type: 'submit'
        , ... props
    };

    return React.createElement<typeof submitButtonProps>(
        renderedComponent
        , submitButtonProps
        , children
    );
};
