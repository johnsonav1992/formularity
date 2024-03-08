import { z } from 'zod';
import {
    FieldComponent
    , createFormStore
    , useFormularity
} from '../src';
import { Formularity } from '../src/Formularity';
import { zodAdapter } from '../src/zodAdapter';
import { TextField } from '@mui/material';

type TestValues = {
    name: string;
    email: string;
    hobbies: string[];
    choice: boolean;
};

const initialValues: TestValues = {
    name: ''
    , email: ''
    , hobbies: [ ]
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

// const OutsideComponent = () => {
//     const {
//         values
//         , handleChange
//         , submitForm
//     } = useFormularity( { formStore } );

//     return (
//         <>
//             <select
//                 multiple
//                 name='hobbies'
//                 value={ values.hobbies }
//                 onChange={ handleChange }
//                 style={ {
//                     width: '200px'
//                     , marginTop: '16px'
//                 } }
//             >
//                 <option value='soccer'>Soccer</option>
//                 <option value='cooking'>Cooking</option>
//                 <option value='cycling'>Cycling</option>
//             </select>
//             <button onClick={ submitForm }>
//                 SUBMIT
//             </button>
//         </>
//     );
// };

const NestedFormWithField = ( { Field }: { Field: FieldComponent<typeof initialValues>} ) => {
    return (
        <Field name='hobbies' />
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
                    , ResetButton
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
                            <Field
                                name='name'
                                component={ TextField }
                                label='name'
                                size='small'
                                validator={ name => {
                                    if ( name.length < 1 ) return 'too short!';
                                } }
                            />
                        </fieldset>
                        <fieldset
                            style={ {
                                display: 'flex'
                                , flexDirection: 'column'
                                , gap: '.5rem'
                            } }
                        >
                            <Field
                                name='email'
                                component={ TextField }
                                label='email'
                                size='small'
                                showErrors
                            />
                        </fieldset>
                        <NestedFormWithField Field={ Field } />
                        <SubmitButton
                            component='div'
                            variant='contained'
                            color='secondary'
                        >
                            Submit
                        </SubmitButton>
                        <ResetButton>
                            Reset
                        </ResetButton>
                    </div>
                ) }
            </Formularity>
            { /* <OutsideComponent /> */ }
            <pre>
                { JSON.stringify( formularity, null, '\t' ) }
            </pre>
        </div>
    );
};

export default AnotherTest;
