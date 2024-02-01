import { PropsWithChildren } from 'react';

// Components
import { AutoBindFormStore } from './AutoBindFormStore';

// Types
import {
    FormStore
    , FormValues
} from './types/types';

type Props<TFormValues extends FormValues> = {
    formStore: FormStore<TFormValues>;
};

export const Formularity = <TFormValues extends FormValues>( {
    formStore
    , children
}: PropsWithChildren<Props<TFormValues>> ) => {
    return (
        <AutoBindFormStore formStore={ formStore }>
            { children }
        </AutoBindFormStore>
    );
};
