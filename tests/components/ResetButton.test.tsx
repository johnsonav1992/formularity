import {
    it
    , expect
    , describe
    , afterEach
    , vi
} from 'vitest';
import {
    render
    , screen
    , cleanup
    , fireEvent
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

    it( 'should fire a reset event on a form if clicked', () => {
        const handleReset = () => {};

        render(
            <>
                <form
                    name='form'
                    onReset={ handleReset }
                >
                    <ResetButton>
                        Reset
                    </ResetButton>
                </form>
            </>
        );

        const button = screen.getByRole( 'button' );
        const form = screen.getByRole( 'form' );
        const handleResetSpy = vi.spyOn( handleReset, 'handleReset' as never );

        button.click();
        fireEvent.reset( form );

        expect( handleResetSpy ).toHaveBeenCalledOnce();
    } );
} );
