import { useFormularity } from '../src/useFormularity';
import { createFormStore } from '../src/createFormStore';

const formStore = createFormStore( {
    name: ''
    , email: ''
    , choice: false
} );

const App = () => {
    const formularity = useFormularity( {
        formStore
        , manualValidationHandler: ( {
            name
            , email
        } ) => {
            const formErrors: Record<string, string> = {};

            if ( name.length < 3 ) {
                formErrors.name = 'Name is too short!';
            }

            if ( !name ) {
                formErrors.name = 'Name is required!';
            }

            if ( !email ) {
                formErrors.email = 'Email is required!';
            }

            return formErrors;
        }
        , onSubmit: values => console.log( 'submit', values )
    } );

    console.log( 'render' );

    const {
        values
        , errors
        , handleSubmit
        , handleChange
        , touched
        , handleBlur
        , handleReset
    } = formularity;

    return (
        <div
            style={ {
                display: 'flex'
                , gap: '1rem'
            } }
        >
            <form
                onSubmit={ handleSubmit }
                onReset={ handleReset }
                style={ {
                    display: 'flex'
                    , flexDirection: 'column'
                    , gap: '1rem'
                    , width: '25%'
                } }
            >
                <fieldset
                    style={ {
                        display: 'flex'
                        , flexDirection: 'column'
                        , gap: '.5rem'
                    } }
                >
                    <label htmlFor='name'>Name</label>
                    <input
                        name='name'
                        value={ values.name }
                        onBlur={ handleBlur }
                        onChange={ handleChange }
                    />
                    { touched.name && errors.name }
                </fieldset>
                <fieldset
                    style={ {
                        display: 'flex'
                        , flexDirection: 'column'
                        , gap: '.5rem'
                    } }
                >
                    <label htmlFor='email'>Email</label>
                    <input
                        name='email'
                        value={ values.email }
                        onChange={ handleChange }
                        onBlur={ handleBlur }
                    />
                    { touched.email && errors.email }
                </fieldset>
                <fieldset
                    style={ {
                        display: 'flex'
                        , flexDirection: 'column'
                        , gap: '.5rem'
                    } }
                >
                    <label htmlFor='choice'>Agree to Terms</label>
                    <input
                        type='checkbox'
                        name='choice'
                        value={ values.choice as unknown as string }
                        checked={ values.choice }
                        onChange={ handleChange }
                    />
                    { errors.choice }
                </fieldset>
                <div
                    style={ {
                        display: 'flex'
                        , gap: '1rem'
                    } }
                >
                    <button type='reset'>Reset</button>
                    <button type='submit'>Submit</button>
                </div>
            </form>
            <pre>
                { JSON.stringify( formularity, null, '\t' ) }
            </pre>
        </div>
    );
};

export default App;
