import { FC } from 'react';

export type ComponentLibraryConfig = {
    libraryName: string;
    checkboxConfig?: {
        checker?: ( Component: FC ) => boolean;
    };
};
