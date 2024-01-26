/* eslint-disable no-autofix/unused-imports/no-unused-imports */
import React from 'react';
import { useForm } from './useForm';

const Test = () => {
    const form = useForm( {
        initialFormValues: {
            name: ''
        }
        , onSubmit: () => {}
    } );

    console.log( 'render' );

    return (
        <div>
            <input onChange={ e => form.setFieldValue( 'name', e.target.value ) } />
            { form.formValues.name }
        </div>
    );
};

export default Test;
