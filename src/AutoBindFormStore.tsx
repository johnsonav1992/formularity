import React, {
    PropsWithChildren
    , ReactElement
    , ReactNode
} from 'react';

// Types
import {
    FormValues
    , UseFormularityReturn
} from './types/types';

export const recursiveChildrenMap = (
    children: ReactNode,
    fn: ( child: ReactNode ) => ReactNode
): ReactNode => {
    return React.Children.map( children, child => {
        if ( !React.isValidElement( child ) ) return child;

        if ( child.props.children ) {
            const props = {
                children: recursiveChildrenMap( child.props.children, fn )
            };

            child = React.cloneElement( child, props );
        }

        return fn( child );
    } );
};

type Props<TFormValues extends FormValues> = {
    formularity: UseFormularityReturn<TFormValues>;
};

export const AutoBindFormStore = <TFormValues extends FormValues>( props: PropsWithChildren<Props<TFormValues>> ) => {
    const {
        formularity
        , children
    } = props;

    return recursiveChildrenMap(
        children
        , child => React.cloneElement( child as ReactElement, { formularity } )
    );
};
