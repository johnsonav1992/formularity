/* eslint-disable no-autofix/unused-imports/no-unused-imports */
import React from 'react';
import { useForm } from '../src/useForm';

const Test = () => {
    const form = useForm( {
        initialFormValues: {
            name: ''
        }
        , onSubmit: () => {}
    } );

    return (
        <div>
            <input onChange={ e => form.setFieldValue( 'name', e.target.value ) } />
            { form.formValues.name }
        </div>
    );
};

export default Test;
