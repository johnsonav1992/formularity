import {
    it
    , expect
    , describe
} from 'vitest';
import {
    renderHook
    , act
} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import {
    FormErrors
    , createFormStore
    , useFormularity
} from '../src';

const renderUseFormularity = () => {
    const initialValues = {
        firstName: ''
        , lastName: ''
        , email: ''
    };

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
    const { result } = renderHook( () => useFormularity( { formStore } ) );

    return {
        formularity: result
        , initialValues
        , formStore
    };
};

describe( 'useFormularity basic', () => {
    it( 'should return the initialValues', () => {
        const {
            formularity
            , initialValues
        } = renderUseFormularity();

        expect( formularity.current.initialValues ).toStrictEqual( initialValues );
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

    it( 'should set a field as touched appropriately', () => {
        const { formularity } = renderUseFormularity();

        act( () => formularity.current.setFieldTouched( 'firstName', true ) );

        expect( formularity.current.touched.firstName ).toBeTruthy();
    } );

} );
