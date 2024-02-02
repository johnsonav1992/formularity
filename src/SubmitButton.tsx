import React, {
    ComponentProps
    , FC
    , ReactNode
} from 'react';

// Types
import { UseFormularityReturn } from './types';

type Props = ComponentProps<'button'> & {
    component?: ReactNode;
    formularity?: UseFormularityReturn;
};

export const SubmitButton = ( {
    component
    , children
    , formularity
}: Props ) => {
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
