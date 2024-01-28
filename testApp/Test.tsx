/* eslint-disable no-autofix/unused-imports/no-unused-imports */
import React from 'react';
import { useFormularity } from '../src/useFormularity';
import { createFormStore } from '../src/createFormStore';

const formStore = createFormStore( {
    name: ''
    , email: ''
    , choice: false
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
        , handleChange
    } = useFormularity( {
        formStore
        , onSubmit: values => console.log( 'submit', values )
    } );

    console.log( values );

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
                <input
                    type='checkbox'
                    name='choice'
                    checked={ values.choice }
                    onChange={ handleChange }
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
