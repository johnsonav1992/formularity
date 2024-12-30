import { FC } from 'react';
import { ComponentLibraryConfig } from './types';
import { Checkbox } from '@mui/material';

/**
 * Configuration plugin for Material UI.
 * Allows all MUI components to work flawlessly
 * with Formularity without any additional setup.
 * @returns {ComponentLibraryConfig}
 */
export function mui (): ComponentLibraryConfig {
    return {
        libraryName: 'mui'
        , checkboxConfig: {
            check: ( Component: FC ) => Component === Checkbox
        }
    };
}
