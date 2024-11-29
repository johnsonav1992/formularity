import {
    it
    , expect
    , describe
    , vi
    , afterEach
} from 'vitest';
import {
    renderHook
    , render
    , screen
    , cleanup
} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import {
    FormErrors
    , FormValues
    , createFormStore
    , useFormularity
} from '../src';
import userEvent from '@testing-library/user-event';

const initialValues = {
    firstName: ''
    , lastName: ''
    , email: ''
};

const renderUseFormularity = ( options?: { initialValues?: FormValues; onSubmit: ( values: typeof initialValues ) => void } ) => {

    const formStore = createFormStore( {
        initialValues: options?.initialValues ?? { ...initialValues }
        , manualValidationHandler: values => {
            const errors: FormErrors<typeof initialValues> = {};

            if ( !values.firstName ) {
                errors.firstName = 'First name is required';
            }

            return errors;
        }
    } );

    const { result } = renderHook( () => useFormularity( {
        formStore
        , onSubmit: options?.onSubmit
    } ) );

    return {
        formularity: result
        , initialValues
        , formStore
    };
};

const renderUI = ( formularity: ReturnType<typeof renderUseFormularity>['formularity'] ) => {
    const handleChange = vi.fn( formularity.current.handleChange );
    const handleSubmit = vi.fn( formularity.current.handleSubmit );
    const handleBlur = vi.fn( formularity.current.handleBlur );
    const handleReset = vi.fn( formularity.current.handleReset );

    const user = userEvent.setup();

    const inputs = Object.keys( formularity.current.initialValues ).map( fieldName => (
        <input
            key={ fieldName }
            name={ fieldName }
            onChange={ handleChange }
            onBlur={ handleBlur }
            aria-label={ fieldName }
        />
    ) );

    const submitButton = (
        <button
            type='submit'
            name='submitBtn'
        >
            Submit
        </button>
    );

    const resetButton = (
        <button
            type='reset'
            name='resetBtn'
        >
            Reset
        </button>
    );

    render(
        <form
            onSubmit={ handleSubmit }
            onReset={ handleReset }
        >
            { inputs }
            { submitButton }
            { resetButton }
        </form>
    );

    return {
        handleChange
        , handleSubmit
        , handleBlur
        , user
    };
};

afterEach( () => cleanup() );

describe( 'useFormularity basic', () => {
    it( 'should handle an input change event', async () => {
        const {
            formularity
        } = renderUseFormularity();

        const {
            handleChange
            , user
        } = renderUI( formularity );

        await user.type(
            screen.getByRole( 'textbox', { name: 'firstName' } )
            , 'Jim'
        );

        expect( handleChange ).toHaveBeenCalledTimes( 3 );
        expect( formularity.current.values.firstName ).toBe( 'Jim' );
    } );

    it( 'should handle an input blur event', async () => {
        const {
            formularity
        } = renderUseFormularity();

        const {
            handleBlur
            , user
        } = renderUI( formularity );

        await user.click( screen.getByRole( 'textbox', { name: 'firstName' } ) );
        await user.click( screen.getByRole( 'textbox', { name: 'email' } ) );

        expect( handleBlur ).toHaveBeenCalledTimes( 1 );
        expect( formularity.current.touched.firstName ).toBe( true );
    } );

    it( 'should submit the form with correct form values', async () => {
        const { formularity } = renderUseFormularity();
        const user = userEvent.setup();

        const { handleSubmit } = renderUI( formularity );

        const fields = screen.getAllByRole( 'textbox' );

        await user.type( fields[ 0 ], 'John' );
        await user.type( fields[ 1 ], 'Doe' );
        await user.type( fields[ 2 ], 'john@doe.com' );

        await user.click( screen.getByRole( 'button', { name: 'Submit' } ) );

        expect( formularity.current.values ).toStrictEqual( {
            firstName: 'John'
            , lastName: 'Doe'
            , email: 'john@doe.com'
        } );
        expect( handleSubmit ).toHaveBeenCalledTimes( 1 );
        expect( handleSubmit ).toHaveBeenCalledWith( expect.objectContaining( {
            type: 'submit'
            , preventDefault: expect.any( Function )
        } ) );
    } );

    it( 'should reset the form correctly after fields have been updated', async () => {
        const { formularity } = renderUseFormularity();
        const user = userEvent.setup();

        renderUI( formularity );

        const fields = screen.getAllByRole( 'textbox' );

        await user.type( fields[ 0 ], 'John' );
        await user.type( fields[ 1 ], 'Doe' );
        await user.type( fields[ 2 ], 'john@doe.com' );
        await user.click( screen.getByRole( 'button', { name: 'Reset' } ) );

        console.log( formularity.current.values );

        expect( formularity.current.values ).toStrictEqual( {
            firstName: ''
            , lastName: ''
            , email: ''
        } );
    } );

    it( 'should prevent full submission and calling of submit handler if errors exist', async () => {
        const onSubmit = vi.fn();

        const { formularity } = renderUseFormularity( { onSubmit } );
        renderUI( formularity );

        const user = userEvent.setup();

        await user.click( screen.getByRole( 'button', { name: 'Submit' } ) );

        expect( onSubmit ).toHaveBeenCalledTimes( 0 );
    } );

    it( 'should keep track of submit count', async () => {
        const { formularity } = renderUseFormularity();

        const user = userEvent.setup();

        renderUI( formularity );

        const submitBtn = screen.getByRole( 'button', { name: 'Submit' } );

        await user.click( submitBtn );
        expect( formularity.current.submitCount ).toBe( 1 );

        await user.click( submitBtn );
        expect( formularity.current.submitCount ).toBe( 2 );
    } );

    it( 'should make instances of the Formularity components available', () => {
        const { formularity } = renderUseFormularity();

        expect( formularity.current.Field ).toBeTypeOf( 'function' );
        expect( formularity.current.SubmitButton ).toBeTypeOf( 'function' );
        expect( formularity.current.FieldList ).toBeTypeOf( 'function' );
        expect( formularity.current.ResetButton ).toBeTypeOf( 'object' ); // React.memo
    } );

} );
