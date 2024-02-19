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
    , hobbies: [
        { name: 'soccer' }
    ]
};

const validationSchema = z.object( {
    name: z.string().min( 1, 'Name must be longer than 1 character' )
    , email: z.string().email( 'Invalid email' )
} );

const formStore = createFormStore( initialValues );

const AnotherTest = () => {
    const formularity = useFormularity( { formStore } );

    return (
        <div>
            <Formularity
                formStore={ formStore }
                onSubmit={ values => alert( JSON.stringify( values, null, '\t' ) ) }
                validationSchema={ zodAdapter( validationSchema ) }
            >
                { ( {
                    Field
                    , SubmitButton
                } ) => (
                    <div
                        style={ {
                            width: '30%'
                            , display: 'flex'
                            , flexDirection: 'column'
                            , gap: '.5rem'
                        } }
                    >
                        <fieldset
                            style={ {
                                display: 'flex'
                                , flexDirection: 'column'
                                , gap: '.5rem'
                            } }
                        >
                            <label htmlFor='name'>Name</label>
                            <Field
                                name='name'
                                value=''
                            />
                        </fieldset>
                        <fieldset
                            style={ {
                                display: 'flex'
                                , flexDirection: 'column'
                                , gap: '.5rem'
                            } }
                        >
                            <label htmlFor='email'>Email</label>
                            <Field
                                name='email'
                                showErrors
                                errorStyles={ { color: 'red' } }
                            />
                        </fieldset>
                        <SubmitButton>
                            Submit
                        </SubmitButton>
                    </div>
                ) }
            </Formularity>
            <pre>
                { JSON.stringify( formularity, null, '\t' ) }
            </pre>
        </div>
    );
};

export default AnotherTest;
