import {
    createFormStore
    , useFormularity
} from '../src';
import { Formularity } from '../src/Formularity';

const initialValues = {
    name: ''
    , email: ''
    , choice: false
    , deep: {
        nested: ''
    }
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
                { ( {
                    Field
                    , SubmitButton
                } ) => (
                    <>
                        <Field name='name' />
                        <Field name='email' />
                        <SubmitButton>
                            Submit
                        </SubmitButton>
                    </>
                ) }
            </Formularity>
            <pre>
                { JSON.stringify( formularity, null, '\t' ) }
            </pre>
        </div>
    );
};

export default AnotherTest;
