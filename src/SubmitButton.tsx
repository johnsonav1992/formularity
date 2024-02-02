import React, {
    ComponentProps
    , FC
    , ReactNode
} from 'react';

type SubmitButtonProps = ComponentProps<'button'> & {
    component?: ReactNode;
};

export const SubmitButton = ( {
    component
    , children
}: SubmitButtonProps ) => {
    const renderedComponent = ( component as unknown as FC ) || 'button';

    const submitButtonProps = {
        type: 'submit'
    };

    return React.createElement<typeof submitButtonProps>(
        renderedComponent
        , submitButtonProps
        , children
    );
};
