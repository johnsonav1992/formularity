import { CSSProperties } from 'react';
import {
    Formularity
    , createFormStore
} from '../src';
import { z } from 'zod';
import { zodAdapter } from 'formularity-zod-adapter';

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
    return (
        <Formularity
            formStore={ formStore }
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
                            zodAdapter(
                                //@ts-ignore -> weird package thing
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
                        label='Do you acknowledge the terms?'
                        //@ts-ignore -> not sure why this is erroring
                        labelProps={ {
                            labelStyles
                        } }
                        type='checkbox'
                        style={ {
                            alignSelf: 'flex-start'
                            , width: '20px'
                        } }
                        showErrors
                        errorProps={ {
                            errorStyles
                        } }
                    />
                    <SubmitButton style={ { height: '40px' } }>
                        Submit
                    </SubmitButton>
                    <ResetButton>
                        Reset
                    </ResetButton>
                </div>
            ) }
        </Formularity>
    );
};

export default BasicTest;