import React, { PropsWithChildren } from 'react';

// Types
import {
    FormStore
    , FormValues
} from './types/types';

// Utils
import { recursiveChildrenMap } from './utils';

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
        , child => React.cloneElement( child, { formStore } )
    );
};
