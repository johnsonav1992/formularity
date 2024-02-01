import React, {
    ComponentProps
    , FC
    , ReactNode
} from 'react';

// Types
import { UseFormularityReturn } from './types/types';

type Props = ComponentProps<'button'> & {
    component?: ReactNode;
    formularity?: UseFormularityReturn;
};

export const SubmitButton = ( {
    component
    , children
    , formularity
}: Props ) => {
    const submitButtonProps = {
        type: 'submit'
        , onSubmit: formularity?.handleSubmit
    };

    return React.createElement<typeof submitButtonProps>(
        ( component || 'button' ) as unknown as FC
        , submitButtonProps
        , children
    );
};
