import { z } from 'zod';
import {
    createFormStore
    , useFormularity
} from '../src';
import { Formularity } from '../src/Formularity';
import { zodAdapter } from '../src/zodAdapter';
import { useState } from 'react';

const initialValues = {
    name: ''
    , email: ''
};

const validationSchema = z.object( {
    name: z.string().min( 1, 'Name must be longer than 1 character' )
    , email: z.string().email( 'Invalid email' )
} );

const formStore = createFormStore( initialValues );

const AnotherTest = () => {
    const formularity = useFormularity( { formStore } );
    const [ init, setinit ] = useState( {
        name: 'Alex'
        , email: 'ajohnson@veryableops.com'
    } );

    return (
        <div>
            <Formularity
                formStore={ formStore }
                onSubmit={ values => alert( JSON.stringify( values, null, '\t' ) ) }
                valuesInitializer={ init }
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
                                showErrors
                                errorStyles={ { color: 'red' } }
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
                        <button
                            type='button'
                            onClick={ () => setinit( {
                                name: 'blah'
                                , email: 'blah@blah.com'
                            } ) }
                        >
                            set new initializer
                        </button>
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
