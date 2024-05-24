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
    deep: {
        nested: number[];
    };
    array: { hey: number }[];
};

const initialValues: TestValues = {
    name: ''
    , email: ''
    , choice: false
    , deep: {
        nested: []
    }
    , array: [ { hey: 0 } ]
};

const validationSchema = z.object( {
    name: z.string().min( 3, 'Must be at least 3 characters' )
    , email: z.string().email( 'Invalid email' )
} );

const formStore = createFormStore( {
    initialValues
    , validationSchema: zodAdapter( validationSchema ) // TODO: FIX SINGLE VALIDATOR
} );

const AnotherTest = () => {
    const formularity = useFormularity( { formStore } );

    const test = formularity.touched.email;
    const t2 = formularity.errors.array?.[ 0 ]?.hey;
    const t3 = formularity.dirtyFields[ 0 ];

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
                            // validator={
                            //     zodAdapter(
                            //         z.string().min( 3 )
                            //         , { isField: false }
                            //     )
                            // }
                            helperText={ touched.name && errors.name }
                            error={ !!errors && touched.name }
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
                        <Field name='deep.nested' />
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
