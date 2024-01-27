/* eslint-disable no-autofix/unused-imports/no-unused-imports */
import React from 'react';
import {
    createFormStore
    , useFormularity
} from '../src/formularity';

const formStore = createFormStore( {
    name: ''
    , email: ''
} );

const Test = () => {
    const {
        values
        , setFieldValue
    } = useFormularity( {
        formStore
        , onSubmit: values => console.log( 'submit', values )
    } );

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
            { values.name }
            { /* <button type='submit'>Submit</button> */ }
            { /* </form> */ }
            <div>ANOTHER</div>
            <Another />
        </div>
    );
};

const Another = () => {
    const {
        values
        , setFieldValue
    } = useFormularity( {
        formStore
        , onSubmit: values => console.log( 'submit', values )
    } );

    return <div>{ values.email }</div>;
};

export default Test;
