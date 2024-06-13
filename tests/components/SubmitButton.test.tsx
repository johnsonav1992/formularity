import {
    it
    , expect
    , describe
    , afterEach
    , vi
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
    , SubmitButtonProps
    , createFormStore
} from '../../src';

afterEach( () => {
    cleanup();
} );

const text = 'Submit';
const initialValues = {
    firstName: ''
    , lastName: ''
    , email: ''
};

const mocks = {
    onSubmit: ( values: typeof initialValues ) => {
        console.log( values );
    }
};

const renderComponents = ( options?: { disable: boolean; disabledMode?: SubmitButtonProps<boolean>['disabledMode'] } ) => {
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
                onSubmit={ mocks.onSubmit }
            >
                { ( {
                    Field
                    , SubmitButton
                } ) => (
                    <>
                        <Field name='firstName' />
                        <Field name='lastName' />
                        <Field name='email' />
                        <SubmitButton
                            disableInvalid={ options?.disable }
                            disabledMode={ options?.disabledMode }
                        >
                            { text }
                        </SubmitButton>
                    </>
                ) }
            </Formularity>
        </>
    );

    return {
        submitButton: screen.getByRole( 'button' )
        , fields: screen.getAllByRole( 'textbox' )
        , user: userEvent.setup()
    };
};

describe( 'SubmitButton Basic', () => {
    it( 'should render a SubmitButton with the text "Submit"', () => {
        const { submitButton } = renderComponents();

        expect( submitButton ).toHaveTextContent( text );
    } );

    it( 'should have a type of "submit" ', () => {
        const { submitButton } = renderComponents();

        expect( submitButton ).toHaveAttribute( 'type', 'submit' );
    } );

    it( 'should call the submit handler when clicked', async () => {
        const submitMock = vi.spyOn( mocks, 'onSubmit' );
        const {
            submitButton
            , fields
            , user
        } = renderComponents();

        await user.type( fields[ 0 ], 'John' );
        await user.type( fields[ 1 ], 'Doe' );
        await user.type( fields[ 2 ], 'john@doe.com' );
        await user.click( submitButton );

        expect( submitMock ).toHaveBeenCalledTimes( 1 );
    } );

    it( 'should disable the button if there are errors in the form', async () => {
        const {
            submitButton
            , fields
            , user
        } = renderComponents( {
            disable: true
        } );

        // Don't fill out the first field
        await user.type( fields[ 1 ], 'Doe' );
        await user.type( fields[ 2 ], 'john@doe.com' );
        await user.click( submitButton );

        expect( submitButton ).toBeDisabled();
    } );

    it( 'should reenable the button if there were errors in the form but they were cleared', async () => {
        const submitMock = vi.spyOn( mocks, 'onSubmit' );
        const {
            submitButton
            , fields
            , user
        } = renderComponents( {
            disable: true
        } );

        // Don't fill out the first field
        await user.type( fields[ 1 ], 'Doe' );
        await user.type( fields[ 2 ], 'john@doe.com' );
        await user.click( submitButton );

        expect( submitButton ).toBeDisabled();

        await user.type( fields[ 0 ], 'John' );
        await user.click( submitButton );

        expect( submitMock ).toHaveBeenCalledTimes( 1 );
    } );
} );
