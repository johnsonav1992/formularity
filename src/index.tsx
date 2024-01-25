import React from 'react';

export * from './types/types';

type TestComponentProps = {
  textText?: string;
  something?: string;
};

export const TestComponent: React.FC<TestComponentProps> = ( {
    textText
    , something
} ) => {
    return <div>{ textText ?? 'Hello!' }</div>;
};
