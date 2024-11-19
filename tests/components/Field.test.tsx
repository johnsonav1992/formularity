import {
    describe
    , afterEach
    , expect
    , it
} from 'vitest';
import {
    cleanup
    , render
    , screen
} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import {
    FormErrors
    , Formularity
    , createFormStore
} from '../../src';

afterEach( () => {
    cleanup();
} );

const initialValues = {
    firstName: ''
    , lastName: ''
    , email: ''
};

const renderComponents = () => {
    const formStore = createFormStore( {
        initialValues
        , manualValidationHandler: values => {
            const errors: FormErrors<typeof initialValues> = {};

            if ( !values.firstName ) {
                errors.firstName = 'First name is required';
            }

            return errors;
        }
    } );

    render(
        <>
            <Formularity
                formStore={ formStore }
            >
                { ( {
                    Field
                } ) => (
                    <>
                        <Field name='firstName' />
                        <Field name='lastName' />
                    </>
                ) }
            </Formularity>
        </>
    );

    return {
        fields: screen.getAllByRole( 'textbox' )
        , user: userEvent.setup()
    };
};

describe( '<Field /> basic', () => {
    it( 'should render the component', () => {
        const { fields } = renderComponents();

        expect( fields[ 0 ] ).toBeInTheDocument();
        expect( fields[ 1 ] ).toBeInTheDocument();
    } );
} );
