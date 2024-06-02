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

const schema = zodAdapter( validationSchema );

const formStore = createFormStore<BasicTestFormValues>( {
    initialValues: {
        name: {
            first: ''
            , last: ''
        }
        , email: ''
        , acknowledgement: false
    }
    , validationSchema: schema
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
        >
            { ( {
                Field
                , SubmitButton
                , errors
            } ) => (
                <div
                    style={ {
                        width: '30%'
                        , display: 'flex'
                        , flexDirection: 'column'
                        , gap: '.5rem'
                    } }
                >
                    <label
                        htmlFor='name.first'
                        style={ labelStyles }
                    >
                        First Name
                    </label>
                    <Field
                        name='name.first'
                        style={ inputStyles }
                        showErrors
                        errorStyles={ errorStyles }
                        validator={
                            zodAdapter(
                                //@ts-ignore -> weird package thing
                                z.string().min( 3, 'Must have 3 or more chars!' )
                                , { isField: true }
                            )
                        }
                    />
                    <label
                        htmlFor='name.first'
                        style={ labelStyles }
                    >
                        Last Name
                    </label>
                    <Field
                        name='name.last'
                        style={ inputStyles }
                        showErrors
                        errorStyles={ errorStyles }
                    />
                    <label
                        htmlFor='name.first'
                        style={ labelStyles }
                    >
                        Email
                    </label>
                    <Field
                        name='email'
                        style={ inputStyles }
                        showErrors
                        errorStyles={ errorStyles }
                    />
                    <label htmlFor='name.first'>
                        Do you acknowledge the terms?
                    </label>
                    <Field
                        name='acknowledgement'
                        type='checkbox'
                        style={ {
                            alignSelf: 'flex-start'
                            , width: '20px'
                        } }
                        showErrors
                        errorStyles={ errorStyles }
                    />
                    <SubmitButton style={ { height: '40px' } }>
                        Submit
                    </SubmitButton>
                    { JSON.stringify( errors ) }
                </div>
            ) }
        </Formularity>
    );
};

export default BasicTest;
