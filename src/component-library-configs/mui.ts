import { FC } from 'react';
import { ComponentLibraryConfig } from './types';
import { Checkbox } from '@mui/material';

export function mui (): ComponentLibraryConfig {
    return {
        libraryName: 'mui'
        , checkboxConfig: {
            checker: ( Component: FC ) => Component === Checkbox
        }
    };
}
