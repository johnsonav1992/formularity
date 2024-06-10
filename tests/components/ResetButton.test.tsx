import {
    it
    , expect
    , describe
    , afterEach
} from 'vitest';
import {
    render
    , screen
    , cleanup
} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { ResetButton } from '../../src/ResetButton';

afterEach( () => {
    cleanup();
} );

describe( 'ResetButton', () => {
    it( 'should render a ResetButton', () => {
        render( <ResetButton /> );
    } );

    it( 'should have a type of "reset" ', () => {
        render( <ResetButton /> );

        const button = screen.getByRole( 'button' );

        expect( button ).toHaveAttribute( 'type', 'reset' );
    } );

    it( 'should render a ResetButton with some text inside', () => {
        const text = 'Reset';

        render(
            <ResetButton>
                { text }
            </ResetButton>
        );

        const button = screen.getByRole( 'button' );

        expect( button ).toHaveTextContent( text );
    } );
} );
