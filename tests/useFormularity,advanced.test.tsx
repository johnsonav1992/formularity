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
