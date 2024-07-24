import { CSSProperties } from 'react';
import {
    Formularity
    , createFormStore
} from '../src';
import { z } from 'zod';
import { zodAdapter } from 'formularity-zod-adapter';
// import { Checkbox } from '@mui/material';

type DemoFormValues = {
    name: {
        first: string;
        last: string;
    };
    aboutYou: string;
    color: 'red' | 'blue' | 'green';
    email: string;
    acknowledgement: boolean;
    date: string;
};


const formStore = createFormStore<DemoFormValues>( {
    initialValues: {
        name: {
            first: ''
            , last: ''
        }
        , aboutYou: ''
        , email: ''
        , color: "blue"
        , acknowledgement: false
        , date: ''
    }
} );

const inputStyles: CSSProperties = {
    height: '40px'
    , fontSize: '1.5rem'
};

const textAreaStyles: CSSProperties = {
  height: '100px'
  , fontSize: '1.5rem'
}

const labelStyles: CSSProperties = {
    fontSize: '1.5rem'
};

const errorStyles: CSSProperties = {
    color: 'red'
};

const DemoForm = () => {

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
                        type='email'

                    />
                    <Field
                      name='aboutYou'
                      label='About Yourself'
                      labelProps={{labelStyles}}
                      style={ textAreaStyles }
                      type='input'
                      component='textarea'
                    />
                    <Field
                      name='date'
                      label='Color Wheel'
                      labelProps={{labelStyles}}
                      style={ inputStyles }
                      type='date'
                      component='input'
                    />
                    <Field
                      name='color'
                      label='Favorite Color'
                      labelProps={{labelStyles}}
                      style={inputStyles}
                      component='select'
                      value={formStore.get().values.color}
                      showErrors
                      errorProps={{
                        errorStyles
                      }}
                    >
                      {
                        ["red", "blue", "green"].map(c => {
                          return (
                            <option value={c}>{c}</option>
                          )
                        })
                      }
                      </Field>
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
                        onClick={ async () => await validateForm( { shouldTouchAllFields: true } ) }
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

export default DemoForm;
