import React, {
    PropsWithChildren
    , ReactElement
    , ReactNode
} from 'react';

// Types
import {
    FormStore
    , FormValues
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
    formStore: FormStore<TFormValues>;
};

export const AutoBindFormStore = <TFormValues extends FormValues>( props: PropsWithChildren<Props<TFormValues>> ) => {
    const {
        formStore
        , children
    } = props;

    return recursiveChildrenMap(
        children
        , child => React.cloneElement( child as ReactElement, { formStore } )
    );
};
