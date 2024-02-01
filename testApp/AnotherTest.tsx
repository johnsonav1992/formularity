import {
    createFormStore
    , useFormularity
} from '../src';
import { Field } from '../src/Field';
import { Formularity } from '../src/Formularity';

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
                    type=''
                    showErrors
                />
                <Field
                    name='email'
                    type=''
                />
                <Field
                    name='choice'
                    type='checkbox'
                />
            </Formularity>
            <pre>
                { JSON.stringify( formularity, null, '\t' ) }
            </pre>
        </div>
    );
};

export default AnotherTest;
