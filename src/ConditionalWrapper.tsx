import { ReactNode } from 'react';

interface Props {
    condition: boolean | undefined;
    wrapper: ( children: ReactNode ) => ReactNode;
    children: ReactNode;
}

/**
 * @description A utility component for implementing a wrapper for a component that should be used on a condtional basis
 * @param condition - The condition for if the wrapper should be used or not
 * @param wrapper - callback for rendering the children
 * @param children - component(s) to be wrapped
 *
 * @returns either the children without a wrapper or wrapped children
 *
 */
export const ConditionalWrapper = ( {
    condition
    , wrapper
    , children
}: Props ) => {
    return condition
        ? (
            <>
                { wrapper( children ) }
            </>
        )
        : (
            <>
                { children }
            </>
        );
};
