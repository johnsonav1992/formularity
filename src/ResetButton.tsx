import React, {
    ComponentProps
    , FC
    , ReactNode
    , memo
} from 'react';

// Types
import { EmptyObject } from './utilityTypes';

export type ResetButtonProps<TComponentProps extends Record<string, unknown> = EmptyObject> =
    ComponentProps<'button'>
    & { component?: ReactNode }
    & TComponentProps;

export const ResetButton = memo( <TComponentProps extends Record<string, unknown> = EmptyObject>( {
    component
    , children
    , ...props
}: ResetButtonProps<TComponentProps> ) => {
    const renderedComponent = component as unknown as FC || 'button';

    const resetButtonProps = {
        type: 'reset'
        , ... props
    };

    return React.createElement<typeof resetButtonProps>(
        renderedComponent
        , resetButtonProps
        , children
    );
} );

ResetButton.displayName = 'ResetButton';
