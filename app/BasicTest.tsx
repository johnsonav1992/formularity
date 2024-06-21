import { CSSProperties } from 'react';
import {
    Formularity
    , createFormStore
} from '../src';
import { z } from 'zod';
import { zodAdapter } from 'formularity-zod-adapter';
import useRenderLogger from '../src/devUtils/useRenderLogger';
// import { Checkbox } from '@mui/material';

type BasicTestFormValues = {
    name: {
        first: string;
        last: string;
    };
    email: string;
    acknowledgement: boolean;
};

const validationSchema = z.object( {
    name: z.object( {
        first: z.string().min( 1, 'First name is required' )
        , last: z.string().min( 1, 'Last name is required' )
    } )
    , email: z.string().email( 'Invalid email' )
    , acknowledgement: z.boolean().refine( val => val === true, 'Must acknowledge!' )
} );

const formStore = createFormStore<BasicTestFormValues>( {
    initialValues: {
        name: {
            first: ''
            , last: ''
        }
        , email: ''
        , acknowledgement: false
    }
    , validationSchema: zodAdapter( validationSchema )
} );

const inputStyles: CSSProperties = {
    height: '40px'
    , fontSize: '1.5rem'
};

const labelStyles: CSSProperties = {
    fontSize: '1.5rem'
};

const errorStyles: CSSProperties = {
    color: 'red'
};

const BasicTest = () => {
    useRenderLogger( 'BasicTest' );

    return (
        <Formularity
            formStore={ createFormStore<BasicTestFormValues>( {
                initialValues: {
                    name: {
                        first: ''
                        , last: ''
                    }
                    , email: ''
                    , acknowledgement: false
                }
                , validationSchema: zodAdapter( validationSchema )
            } ) }
            onSubmit={ values => console.log( values ) }
            // valuesInitializer={ {
            //     name: {
            //         first: 'John'
            //         , last: 'Doe'
            //     }
            //     , email: 'XXXXXXXXXXXX'
            //     , acknowledgement: true
            // } }
        >
            { ( {
                Field
                , SubmitButton
                , ResetButton
                , validateForm
                , ...formularity
            } ) => (
                <div
                    style={ {
                        width: '30%'
                        , display: 'flex'
                        , flexDirection: 'column'
                        , gap: '.5rem'
                    } }
                >
                    { console.log( 'render' ) }
                    <Field
                        name='name.first'
                        label='First Name'
                        labelProps={ {
                            labelStyles
                        } }
                        style={ inputStyles }
                        showErrors
                        errorProps={ {
                            errorStyles
                        } }
                        validator={
                            zodAdapter<BasicTestFormValues, 'name.first'>(
                                z.string().min( 3, 'Must have 3 or more chars!' )
                                , { isField: true }
                            )
                        }
                    />
                    <Field
                        name='name.last'
                        label='Last Name'
                        labelProps={ {
                            labelStyles
                        } }
                        style={ inputStyles }
                        showErrors
                        errorProps={ {
                            errorStyles
                        } }
                    />
                    <Field
                        name='email'
                        label='Email'
                        labelProps={ {
                            labelStyles
                        } }
                        style={ inputStyles }
                        showErrors
                        errorProps={ {
                            errorStyles
                        } }
                    />
                    <Field
                        name='acknowledgement'
                        // component={ Checkbox }
                        label='Do you acknowledge the terms?'
                        labelProps={ {
                            labelStyles
                        } }
                        type='checkbox'
                        // value={ values.acknowledgement }
                        style={ {
                            alignSelf: 'flex-start'
                            , width: '20px'
                        } }
                        showErrors
                        errorProps={ {
                            errorStyles
                        } }
                    />
                    <button
                        type='button'
                        onClick={ async () => await validateForm() }
                    >
                        Validate
                    </button>
                    <SubmitButton style={ { height: '40px' } }>
                        Submit
                    </SubmitButton>
                    <ResetButton>
                        Reset
                    </ResetButton>
                    <pre>
                        { JSON.stringify( formularity, null, '\t' ) }
                    </pre>
                </div>
            ) }
        </Formularity>
    );
};

export default BasicTest;
