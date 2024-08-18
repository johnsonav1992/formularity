/* eslint-disable react/display-name */
import {
    ComponentType
    , memo
} from 'react';
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
