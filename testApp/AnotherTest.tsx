import { z } from 'zod';
import {
    FieldComponent
    , createFormStore
    , useFormularity
} from '../src';
import { Formularity } from '../src/Formularity';
import { zodAdapter } from '../src/zodAdapter';

const initialValues = {
    name: ''
    , email: ''
    , hobbies: [ 'soccer' ]
    , choice: false
};

const validationSchema = z.object( {
    name: z.string().min( 1, 'Name must be longer than 1 character' )
    , email: z.string().email( 'Invalid email' )
} );

const formStore = createFormStore( {
    initialValues
    , validationSchema: zodAdapter( validationSchema )
    , onSubmit: values => console.log( 'heyya!!!' )
} );

const OutsideComponent = () => {
    const {
        values
        , handleChange
        , submitForm
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
            <button onClick={ submitForm }>
                SUBMIT
            </button>
        </>
    );
};

const NestedFormWithField = ( { Field }: { Field: FieldComponent<typeof initialValues>} ) => {
    return (
        <Field name='email' />
    );
};

const AnotherTest = () => {
    const formularity = useFormularity( { formStore } );

    return (
        <div>
            <Formularity
                formStore={ formStore }
                onSubmit={ values => alert( JSON.stringify( values, null, '\t' ) ) }
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
                            />
                        </fieldset>
                        <NestedFormWithField Field={ Field } />
                        <SubmitButton>
                            Submit
                        </SubmitButton>
                    </div>
                ) }
            </Formularity>
            <OutsideComponent />
            <pre>
                { JSON.stringify( formularity, null, '\t' ) }
            </pre>
        </div>
    );
};

export default AnotherTest;
