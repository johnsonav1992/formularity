import { z } from 'zod';
import {
    createFormStore
    , useFormularity
} from '../src';
import { Formularity } from '../src/Formularity';
import { zodAdapter } from '../src/zodAdapter';

const initialValues = {
    name: ''
    , email: ''
    , choice: false
    , deep: {
        nested: ''
    }
};

const validationSchema = z.object( {
    name: z.string().min( 1, 'Name must be longer than 1 character' )
} );

const formStore = createFormStore( initialValues );

const AnotherTest = () => {
    const formularity = useFormularity( { formStore } );

    console.log( formularity.values, formularity.errors );

    return (
        <div>
            <Formularity
                formStore={ formStore }
                onSubmit={ values => alert( values ) }
                validationSchema={ zodAdapter( validationSchema ) }
            >
                { ( {
                    Field
                    , SubmitButton
                } ) => (
                    <>
                        <Field
                            name='name'
                            showErrors
                        />
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
