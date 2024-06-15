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

const { result } = renderHook( () => useFormularity( { formStore } ) );

describe( 'useFormularity', () => {
    it( 'should return the initialValues', () => {
        expect( result.current.initialValues ).toStrictEqual( initialValues );
    } );

    it( 'should set a field value appropriately', () => {
        act( () => result.current.setFieldValue( 'firstName', 'John' ) );

        expect( result.current.values.firstName ).toBe( 'John' );
    } );
} );
