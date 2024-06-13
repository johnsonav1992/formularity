import {
    it
    , expect
    , describe
    , beforeAll
} from 'vitest';
import {
    render
    , screen
} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import {
    Formularity
    , createFormStore
} from '../../src';

const text = 'Reset';
const initialValues = {
    firstName: ''
    , lastName: ''
    , email: ''
};

const user = userEvent.setup();

beforeAll( () => {
    const formStore = createFormStore( { initialValues } );

    render(
        <>
            <Formularity formStore={ formStore }>
                { ( {
                    Field
                    , ResetButton
                } ) => (
                    <>
                        <Field name='firstName' />
                        <Field name='lastName' />
                        <Field name='email' />
                        <ResetButton>
                            { text }
                        </ResetButton>
                    </>
                ) }
            </Formularity>
        </>
    );
} );

describe( 'ResetButton', () => {
    it( 'should render a ResetButton', () => {} );

    it( 'should have a type of "reset" ', () => {
        const button = screen.getByRole( 'button' );

        expect( button ).toHaveAttribute( 'type', 'reset' );
    } );

    it( 'should render a ResetButton with some text inside', () => {
        const button = screen.getByRole( 'button' );

        expect( button ).toHaveTextContent( text );
    } );

    it( 'should reset the form if it has been altered', async () => {
        const fields = screen.getAllByRole( 'textbox' );
        const firstNameField = fields[ 0 ];
        const resetButton = screen.getByRole( 'button' );

        await user.type( firstNameField, 'Alex J.' );
        expect( firstNameField ).toHaveValue( 'Alex J.' );

        await user.click( resetButton );
        expect( firstNameField ).toHaveValue( initialValues.firstName );
    } );
} );
