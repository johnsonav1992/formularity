import { z } from 'zod';
import {
    createFormStore
    , useFormularity
} from '../src';
import { Formularity } from '../src/Formularity';
import { zodAdapter } from '../src/zodAdapter';
import { Checkbox } from '@mui/material';

const Comp = ( { yo }: { yo?: string} ) => {
    return null;
};

const initialValues = {
    name: ''
    , email: ''
    , hobbies: 'soccer'
    , choice: false
};

const validationSchema = z.object( {
    name: z.string().min( 1, 'Name must be longer than 1 character' )
    , email: z.string().email( 'Invalid email' )
} );

const formStore = createFormStore( {
    initialValues
    , validationSchema: zodAdapter( validationSchema )
} );

const ChildComponent = () => {
    const {
        values
        , handleChange
    } = useFormularity( { formStore } );

    return (
        <>
            <select
                multiple
                name='hobbies'
                value={ values.hobbies }
                onChange={ handleChange }
                style={ {
                    width: '200px'
                    , marginTop: '16px'
                } }
            >
                <option value='soccer'>Soccer</option>
                <option value='cooking'>Cooking</option>
                <option value='cycling'>Cycling</option>
            </select>
        </>
    );
};

const AnotherTest = () => {
    const formularity = useFormularity( { formStore } );

    console.log( 'render' );

    return (
        <div>
            <Formularity
                formStore={ formStore }
                onSubmit={ values => alert( JSON.stringify( values, null, '\t' ) ) }
            >
                { ( {
                    Field
                    , SubmitButton
                    , values
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
                            />
                        </fieldset>
                        <div>
                            <Field
                                name='choice'
                                component={ Checkbox }
                                checked={ values.choice }
                            />
                        </div>
                        <SubmitButton>
                            Submit
                        </SubmitButton>
                    </div>
                ) }
            </Formularity>
            { /* <ChildComponent /> */ }
            { /* <pre>
                { JSON.stringify( formularity, null, '\t' ) }
            </pre> */ }
        </div>
    );
};

export default AnotherTest;
