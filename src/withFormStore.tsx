/* eslint-disable react/display-name */
import { ComponentType } from 'react';
import {
    FormStore
    , FormValues
} from './types';

export const withFormStore = <TFormValues extends FormValues, TComponentProps>(
    Component: ComponentType<TComponentProps>,
    formStore: FormStore<TFormValues>
): ComponentType<TComponentProps> => {
    return ( props: TComponentProps ) => (
        <Component
            { ...props }
            formStore={ formStore }
        />
    );
};
