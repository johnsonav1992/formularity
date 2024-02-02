import {
    createFormStore
    , useFormularity
} from '../src';
import { Field } from '../src/Field';
import { Formularity } from '../src/Formularity';
import { SubmitButton } from '../src/SubmitButton';

const initialValues = {
    name: ''
    , email: ''
    , choice: false
};

const formStore = createFormStore( initialValues );

const AComponent = ( { something }: { something?: string} ) => (
    <input />
);

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
                    showErrors
                    errorStyles={ { color: 'red' } }
                    style={ { width: '100%' } }
                />
                <Field
                    name='email'
                />
                <Field
                    name='choice'
                    type='checkbox'
                />
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
