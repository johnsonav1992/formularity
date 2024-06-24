import {
    it
    , expect
    , describe
    , vi
    , afterEach
} from 'vitest';
import {
    renderHook
    , act
    , fireEvent
    , render
    , screen
    , cleanup
} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import {
    FormValues
    , createFormStore
    , useFormularity
} from '../src';
import { zodAdapter } from 'formularity-zod-adapter';
import { z } from 'zod';

const renderUseFormularity = ( options?: { initialValues?: FormValues } ) => {
    const initialValues = {
        firstName: ''
        , lastName: ''
        , email: ''
    };

    const formStore = createFormStore( {
        initialValues: options?.initialValues ?? initialValues
        , validationSchema: zodAdapter( z.object( {
            firstName: z.string().min( 1 ).max( 10 )
            , lastName: z.string().min( 1 ).max( 10 )
            , email: z.string().email()
        } ) )
    } );

    const { result } = renderHook( () => useFormularity( { formStore } ) );

    return {
        formularity: result
        , initialValues
        , formStore
    };
};

afterEach( () => cleanup() );

describe( 'useFormularity Advanced', () => {
    it( 'should validate the entire form and touch all fields when calling validateForm', async () => {
        const { formularity } = renderUseFormularity();

        await act( async () => await formularity.current.validateForm() );

        expect( formularity.current.errors ).toStrictEqual( {
            firstName: 'First name is required'
            , lastName: 'Last name is required'
            , email: 'Email is required'
        } );
    } );
} );
