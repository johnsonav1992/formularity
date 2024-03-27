import { z } from 'zod';
import {
    createFormStore
    , useFormularity
} from '../src';
import { Formularity } from '../src/Formularity';
import { zodAdapter } from 'formularity-zod-adapter';
import {
    Button
    , Stack
    , TextField
} from '@mui/material';

type TestValues = {
    name: string;
    email: string;
    choice: boolean;
};

const initialValues: TestValues = {
    name: ''
    , email: ''
    , choice: false
};

const validationSchema = z.object( {
    name: z.string().min( 3, 'Must be at least 3 characters' )
    , email: z.string().email( 'Invalid email' )
} );

const formStore = createFormStore( {
    initialValues
    , validationSchema: zodAdapter( validationSchema )
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

// const NestedFormWithField = ( { Field }: { Field: FieldComponent<typeof initialValues>} ) => {
//     return (
//         <Field name='hobbies' />
//     );
// };

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
                    , errors
                    , touched
                } ) => (
                    <div
                        style={ {
                            width: '30%'
                            , display: 'flex'
                            , flexDirection: 'column'
                            , gap: '.5rem'
                        } }
                    >
                        <Field
                            name='name'
                            component={ TextField }
                            label='name'
                            size='small'
                            placeholder='Hey!'
                            fieldPosition={ 1 }
                            validator={
                                zodAdapter(
                                    z.string().min( 3 )
                                    , { isField: false }
                                )
                            }
                            helperText={ touched.name && errors.name }
                            error={ !!errors.name && touched.name }
                        />
                        <Field
                            name='email'
                            component={ TextField }
                            label='email'
                            size='small'
                            helperText={ touched.email && errors.email }
                            error={ !!errors.email && touched.email }
                        />
                        <Field
                            name='choice'
                            type='checkbox'
                        />
                        <Stack
                            direction='row'
                            gap='1rem'
                        >
                            <ResetButton
                                component={ Button }
                                variant='outlined'
                                fullWidth
                            >
                                Reset
                            </ResetButton>
                            <SubmitButton
                                component={ Button }
                                variant='contained'
                                fullWidth
                                disableInvalid
                                disabledMode='after-first-submission'
                            >
                                Submit
                            </SubmitButton>
                        </Stack>
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
