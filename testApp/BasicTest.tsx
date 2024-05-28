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
        first: z.string().min( 1 )
        , last: z.string().min( 1 )
    } )
    , email: z.string().email()
    , acknowledgement: z.boolean()
} );

const formStore = createFormStore( {
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
