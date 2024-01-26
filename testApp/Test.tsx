/* eslint-disable no-autofix/unused-imports/no-unused-imports */
import React from 'react';
import { useForm } from '../src/useForm';

const Test = () => {
    const {
        handleChange
        , formValues
    } = useForm( {
        initialFormValues: {
            name: ''
        }
        , onSubmit: () => {}
    } );

    return (
        <div>
            <input
                name='name'
                value={ formValues.name }
                onChange={ handleChange }
            />
            { formValues.name }
        </div>
    );
};

export default Test;
