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
        , isValid
        , handleSubmit
        , submitCount
        , isSubmitting
    } = useFormularity( {
        formStore
        , onSubmit: values => console.log( 'submit', values )
    } );

    console.log( values, submitCount, isSubmitting );

    return (
        <div
            style={ {
                display: 'flex'
                , flexDirection: 'column'
                , gap: '1rem'
            } }
        >
            <form onSubmit={ handleSubmit }>
                <input
                    name='name'
                    value={ values.email }
                    onChange={ e => setFieldValue( 'email', e.target.value ) }
                />
                <button type='submit'>Submit</button>
            </form>
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
