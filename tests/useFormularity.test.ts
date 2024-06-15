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

describe( 'useFormularity', () => {
    const { result } = renderHook( () => useFormularity( { formStore } ) );

    it( 'should return the initialValues', () => {
        expect( result.current.initialValues ).toStrictEqual( initialValues );
    } );

    it( 'should initialize with an empty errors object', () => {
        expect( result.current.errors ).toStrictEqual( {} );
    } );

    it( 'should initialize with an empty touched object', () => {
        expect( result.current.touched ).toStrictEqual( {} );
    } );

    it( 'should set a field value appropriately', () => {
        act( () => result.current.setFieldValue( 'firstName', 'John' ) );

        expect( result.current.values.firstName ).toBe( 'John' );
    } );

    it( 'should set all field values appropriately', () => {
        const newValues = {
            firstName: 'John'
            , lastName: 'Smith'
            , email: 'john@example.com'
        };

        act( () => result.current.setValues( newValues ) );

        expect( result.current.values ).toStrictEqual( newValues );
    } );

    it( 'should set some field values appropriately', () => {
        const newValues: Partial<typeof initialValues> = {
            firstName: 'John'
            , email: 'john@example.com'
        };

        act( () => result.current.setValues( newValues ) );

        console.log( result.current.values );

        expect( result.current.values ).toStrictEqual( {
            ...newValues
            , lastName: initialValues.lastName
        } );
    } );

    it( 'should set a field as touched appropriately', () => {
        act( () => result.current.setFieldTouched( 'firstName', true ) );

        expect( result.current.touched.firstName ).toBeTruthy();
    } );
} );
