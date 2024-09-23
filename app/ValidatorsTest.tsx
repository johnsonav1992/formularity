import { CSSProperties } from 'react';
import {
    Formularity
    , createFormStore
} from '../src';
import {
    matchField
    , min
    , pattern
    , required
} from '../src/validators';
import { match } from 'assert';

const formStore = createFormStore( {
    initialValues: {
        username: ''
        , password: ''
        , confirmPassword: ''
    }
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

const passRegex = new RegExp(
    '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$'
);

const ValidatorsTest = () => {

    return (
        <Formularity
            formStore={ formStore }
            onSubmit={ values => console.log( values ) }
            formProps={ { style: { width: '100%' } } }
        >
            { ( {
                Field
                , SubmitButton
                , ResetButton
                , ...formularity
            } ) => (
                <div
                    style={ {
                        display: 'flex'
                        , width: '100%'
                        , flexDirection: 'column'
                        , gap: '.5rem'
                    } }
                >
                    <Field
                        name='username'
                        label='Username'
                        labelProps={ { labelStyles } }
                        style={ inputStyles }
                        showErrors
                        errorProps={ { errorStyles } }
                        validators={ [ required(), min( 3 ) ] }
                    />
                    <Field
                        name='password'
                        label='Password'
                        type='password'
                        labelProps={ { labelStyles } }
                        style={ inputStyles }
                        showErrors
                        errorProps={ {
                            errorStyles
                        } }
                        validators={ [
                            required()
                            , pattern(
                                passRegex,
                                'Password must be at least 8 characters long,'
                                + ' contain one uppercase letter, one lowercase letter,'
                                + ' one digit, and one special character.'
                            )
                            , matchField( 'confirmPassword', 'Must match password confirmation' )
                        ] }
                    />
                    <Field
                        name='confirmPassword'
                        label='Confirm Password'
                        type='password'
                        labelProps={ { labelStyles } }
                        style={ inputStyles }
                        showErrors
                        errorProps={ { errorStyles } }
                        validators={ [ required(), matchField( 'password' ) ] }
                    />
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

export default ValidatorsTest;
