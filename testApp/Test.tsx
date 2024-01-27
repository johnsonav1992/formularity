/* eslint-disable no-autofix/unused-imports/no-unused-imports */
import React from 'react';
import { useFormularity } from '../src/useFormularity';
import { createFormStore } from '../src/createFormStore';

const formStore = createFormStore( {
    name: ''
    , email: ''
} );

const Test = () => {
    const {
        values
        , errors
        , setFieldValue
        , setFieldError
    } = useFormularity( {
        formStore
        , onSubmit: values => console.log( 'submit', values )
    } );

    console.log( errors );

    return (
        <div
            style={ {
                display: 'flex'
                , flexDirection: 'column'
                , gap: '1rem'
            } }
        >
            { /* <form onSubmit={ handleSubmit }> */ }
            <input
                name='name'
                value={ values.name }
                onChange={ e => setFieldValue( 'name', e.target.value ) }
            />
            { /* <button type='submit'>Submit</button> */ }
            { /* </form> */ }
            <div>ANOTHER</div>
            <Another />
            <button
                type='button'
                onClick={ () => setFieldError( 'name', 'ERROR' ) }
            >set error</button>
        </div>
    );
};

const Another = () => {
    const {
        values
    } = useFormularity( {
        formStore
        , onSubmit: values => console.log( 'submit', values )
    } );

    return <div>{ values.name }</div>;
};

export default Test;
