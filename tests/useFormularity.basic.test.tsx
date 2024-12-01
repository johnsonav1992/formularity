import {
    it
    , expect
    , describe
    , afterEach
} from 'vitest';
import {
    renderHook
    , act
    , cleanup
} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import {
    FormErrors
    , FormValues
    , createFormStore
    , useFormularity
} from '../src';

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

afterEach( () => cleanup() );

describe( 'useFormularity basic', () => {
    it( 'should use a store with the proper store type and methods', () => {
        const {
            formStore
        } = renderUseFormularity();

        expect( formStore ).toBeTypeOf( 'object' );
        expect( formStore ).toHaveProperty( 'get' );
        expect( formStore ).toHaveProperty( 'set' );
        expect( formStore ).toHaveProperty( 'subscribe' );
    } );

    it( 'should return the initialValues', () => {
        const {
            formularity
            , initialValues
        } = renderUseFormularity();

        expect( formularity.current.initialValues ).toStrictEqual( initialValues );
    } );

    it( 'should return the values', () => {
        const {
            formularity
            , initialValues
        } = renderUseFormularity();

        expect( formularity.current.values ).toStrictEqual( initialValues );
    } );

    it( 'should initialize with an empty errors object', () => {
        const { formularity } = renderUseFormularity();

        expect( formularity.current.errors ).toStrictEqual( {} );
    } );

    it( 'should initialize with an empty touched object', () => {
        const { formularity } = renderUseFormularity();

        expect( formularity.current.touched ).toStrictEqual( {} );
    } );

    it( 'should set a field value appropriately', () => {
        const { formularity } = renderUseFormularity();

        act( () => formularity.current.setFieldValue( 'firstName', 'John' ) );

        expect( formularity.current.values.firstName ).toBe( 'John' );
    } );

    it( 'should set all field values appropriately', () => {
        const { formularity } = renderUseFormularity();

        const newValues = {
            firstName: 'John'
            , lastName: 'Smith'
            , email: 'john@example.com'
        };

        act( () => formularity.current.setValues( newValues ) );

        expect( formularity.current.values ).toStrictEqual( newValues );
    } );

    it( 'should set some field values appropriately', () => {
        const {
            formularity
            , initialValues
        } = renderUseFormularity();

        const newValues = {
            firstName: 'John'
            , email: 'john@example.com'
        };

        act( () => formularity.current.setValues( newValues ) );

        expect( formularity.current.values ).toStrictEqual( {
            ...newValues
            , lastName: initialValues.lastName
        } );
    } );

    it( 'should set a field as touched appropriately', async () => {
        const { formularity } = renderUseFormularity();

        await act( () => formularity.current.setFieldTouched( 'firstName', true ) );

        expect( formularity.current.touched.firstName ).toBeTruthy();
    } );

    it( 'should set some fields as touched appropriately', () => {
        const { formularity } = renderUseFormularity();

        act( () => formularity.current.setTouched( {
            firstName: true
            , lastName: true
        } ) );

        expect( formularity.current.touched.firstName ).toBeTruthy();
        expect( formularity.current.touched.lastName ).toBeTruthy();
        expect( formularity.current.touched.email ).toBeFalsy();
    } );

    it( 'should manually set a field error', () => {
        const { formularity } = renderUseFormularity();

        act( () => formularity.current.setFieldError( 'firstName', 'First name is required' ) );

        expect( formularity.current.errors.firstName ).toBe( 'First name is required' );
    } );

    it( 'should manually set some field errors', () => {
        const { formularity } = renderUseFormularity();

        act( () => formularity.current.setErrors( {
            firstName: 'First name is required'
            , lastName: 'Last name is required'
        } ) );

        expect( formularity.current.errors.firstName ).toBe( 'First name is required' );
        expect( formularity.current.errors.lastName ).toBe( 'Last name is required' );
    } );

    it( 'should indicate the form is dirty if initialValues does not deeply equal to values', () => {
        const { formularity } = renderUseFormularity();

        act( () => formularity.current.setFieldValue( 'firstName', 'Bob' ) );

        expect( formularity.current.isDirty ).toBeTruthy();
        expect( formularity.current.values ).not.toStrictEqual( formularity.current.initialValues );
    } );

    it( 'should indicate the form is pristine if initialValues deeply equals values', () => {
        const { formularity } = renderUseFormularity();

        expect( formularity.current.isPristine ).toBeTruthy();
        expect( formularity.current.values ).toStrictEqual( formularity.current.initialValues );
    } );

    it( 'should be valid if no errors exist in the form', () => {
        const { formularity } = renderUseFormularity();

        expect( formularity.current.errors ).toStrictEqual( {} );
        expect( formularity.current.isValid ).toBeTruthy();
    } );

    it( 'should not be valid if errors exist in the form', () => {
        const { formularity } = renderUseFormularity();

        act( () => formularity.current.setFieldError( 'lastName', 'Last name is required' ) );

        expect( formularity.current.errors.lastName ).toBe( 'Last name is required' );
        expect( formularity.current.isValid ).toBeFalsy();
    } );

    it( 'should list an array of dirty fields if they have been altered from their initial values', () => {
        const {
            formularity
            , initialValues
        } = renderUseFormularity();

        act( () => formularity.current.setValues( {
            email: 'j@j.com'
            , firstName: 'J Man'
        } ) );

        expect( formularity.current.values.email ).not.toStrictEqual( initialValues.email );
        expect( formularity.current.values.firstName ).not.toStrictEqual( initialValues.firstName );
        expect( formularity.current.dirtyFields ).toStrictEqual( [ 'firstName', 'email' ] );
    } );

    it( 'should indicate that the form has been touched if any field in the form has a touched status', async () => {
        const { formularity } = renderUseFormularity();

        await act( async () => formularity.current.setFieldTouched( 'email', true ) );

        expect( formularity.current.isFormTouched ).toBeTruthy();
    } );

    it( 'should indicate if all fields in the form have been touched', async () => {
        const { formularity } = renderUseFormularity();

        await act( async () => {
            formularity.current.setTouched( {
                email: true
                , firstName: true
                , lastName: true
            } );
        } );

        expect( formularity.current.touched ).toStrictEqual( {
            email: true
            , firstName: true
            , lastName: true
        } );
        expect( formularity.current.areAllFieldsTouched ).toBeTruthy();
    } );

    it( 'should make instances of the Formularity components available', () => {
        const { formularity } = renderUseFormularity();

        expect( formularity.current.Field ).toBeTypeOf( 'function' );
        expect( formularity.current.SubmitButton ).toBeTypeOf( 'function' );
        expect( formularity.current.FieldList ).toBeTypeOf( 'function' );
        expect( formularity.current.ResetButton ).toBeTypeOf( 'object' ); // React.memo
    } );
} );
