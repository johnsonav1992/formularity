import {
    it
    , expect
    , describe
    , afterEach
    , beforeAll
} from 'vitest';
import {
    render
    , screen
} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import { ResetButton } from '../../src/ResetButton';
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

beforeAll( () => {
    const formStore = createFormStore( { initialValues } );

    render(
        <>
            <Formularity formStore={ formStore }>
                { ( { Field } ) => (
                    <>
                        <Field
                            name='firstName'
                            label='First Name'
                        />
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

afterEach( () => {
    // cleanup();
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
        const user = userEvent.setup();
        const fields = screen.getAllByRole( 'textbox' );
        const firstNameField = fields[ 0 ];
        const resetButton = screen.getByRole( 'button' );

        await user.type( firstNameField, 'Alex J.' );
        expect( firstNameField ).toHaveValue( 'Alex J.' );

        await user.click( resetButton );
        expect( firstNameField ).toHaveValue( initialValues.firstName );
    } );
} );
