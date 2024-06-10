import {
    it
    , expect
    , describe
} from 'vitest';
import React from 'react';
import {
    render
    , screen
} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { ResetButton } from '../../src/ResetButton';

describe( 'ResetButton', () => {
    it( 'should render a ResetButton', () => {
        render( <ResetButton /> );
    } );

    it( 'should render a ResetButton with some text inside', () => {
        const text = 'Reset';

        render(
            <ResetButton>
                { text }
            </ResetButton>
        );

        const buttons = screen.getAllByRole( 'button' );

        expect( buttons[ 1 ] ).toHaveTextContent( text );
    } );
} );
