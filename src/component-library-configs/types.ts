import { FC } from 'react';

export type ComponentLibraryConfig = {
    libraryName: string;
    checkboxConfig?: {
        check?: ( Component: FC ) => boolean;
    };
};
