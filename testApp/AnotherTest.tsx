import {
    createFormStore
    , useFormularity
} from '../src';
import { Field } from '../src/Field';
import { Formularity } from '../src/Formularity';
import { SubmitButton } from '../src/SubmitButton';
import { Checkbox } from '@mui/material';

const initialValues = {
    name: ''
    , email: ''
    , choice: false
};

const formStore = createFormStore( initialValues );

const AnotherTest = () => {
    const formularity = useFormularity( { formStore } );

    console.log( formularity.values, formularity.errors );

    return (
        <div>
            <Formularity
                formStore={ formStore }
                onSubmit={ values => alert( values ) }
                manualValidationHandler={ ( {
                    name
                    , email
                } ) => {
                    const formErrors: Record<string, string> = {};

                    if ( name.length < 3 ) {
                        formErrors.name = 'Name is too short!';
                    }

                    if ( !name ) {
                        formErrors.name = 'Name is required!';
                    }

                    if ( !email ) {
                        formErrors.email = 'Email is required!';
                    }

                    return formErrors;
                } }
            >
                <Field
                    name='name'
                    component={ Checkbox }
                />
                <Checkbox />
                <input
                    type='checkbox'
                    name='choice'
                    onChange={ formularity.handleChange }
                    checked={ formularity.values.choice }
                />
                <input />
                <Field
                    name='email'
                />
                { /* <Field
                    name='choice'
                    type='checkbox'
                /> */ }
                <SubmitButton>
                    Submit
                </SubmitButton>
            </Formularity>
            <pre>
                { JSON.stringify( formularity, null, '\t' ) }
            </pre>
        </div>
    );
};

export default AnotherTest;
