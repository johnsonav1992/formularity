/* eslint-disable react/display-name */
import {
    ComponentType
    , memo
} from 'react';

// Types
import {
    FormStore
    , FormValues
} from './types';

export const withFormStore = <
        TComponentProps,
        TFormValues extends FormValues
    >(
        Component: ComponentType<TComponentProps & { formStore: FormStore<TFormValues> }>
        , formStore: FormStore<TFormValues>
    ) => {

    return memo( ( props: TComponentProps ) => {
        return (
            <Component
                { ...props }
                formStore={ formStore }
            />
        );
    } );
};

export const throwFormStoreError = ( comp: string ) => {
    throw new Error(
        `Must use <${ comp } /> component from the children render prop of <Formularity /> `
        + `or pass a formStore prop to <${ comp } /> explicitly`
    );
};
