import React from 'react';

import s from './styles.module.css';

export * from './types/types';

type TestComponentProps = {
  textText?: string;
  something?: string;
};

export const TestComponent: React.FC<TestComponentProps> = ( {
    textText
    , something
} ) => {
    return <div className={ s.root }>{ textText ?? 'Hello!' }</div>;
};
