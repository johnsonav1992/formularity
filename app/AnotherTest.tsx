import { z } from 'zod';
import {
    createFormStore
    , useFormularity
} from '../src';
import { Formularity } from '../src/Formularity';
import { zodAdapter } from 'formularity-zod-adapter';
import {
    Button
    , CircularProgress
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
};

const initialValues: TestValues = {
    name: ''
    , email: ''
    , choice: false
    , deep: {
        nested: []
    }
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

    return (
        <div>
            <Formularity
                formStore={ formStore }
                onSubmit={ values => {
                    return new Promise( resolve => setTimeout( () => {
                        console.log( 'SUBMITTED' );
                        resolve();
                    }
                    , 3000 ) );
                } }
            >
                { ( {
                    Field
                    , SubmitButton
                    , ResetButton
                    , errors
                    , touched
                    , isSubmitting
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
                            // validator={
                            //     zodAdapter(
                            //         z.string().min( 3 )
                            //         , { isField: true }
                            //     )
                            // }
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
                        { /* <Field name='deep.nested' /> */ }
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
                                { isSubmitting
                                    ? (
                                        <CircularProgress color='inherit' />
                                    )
                                    : 'Submit'
                                }
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
