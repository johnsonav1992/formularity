import { useFormularity } from '../src/useFormularity';
import { createFormStore } from '../src/createFormStore';

const formStore = createFormStore( {
    name: ''
    , email: ''
    , choice: false
} );

const App = () => {
    const {
        values
        , errors
        , setFieldValue
        , setFieldError
        , isValid
        , handleSubmit
        , submitCount
        , isSubmitting
        , handleChange
        , isDirty
        , initialValues
        , dirtyFields
        , setFieldTouched
        , touched
        , isFormTouched
        , handleBlur
        , isFormMounted
        , resetForm
    } = useFormularity( {
        formStore
        , manualValidationHandler: ( { name } ) => {
            const formErrors: Record<string, string> = {};

            if ( name.length < 3 ) {
                formErrors.name = 'Name is too short!';
            }

            if ( !name ) {
                formErrors.name = 'Name is required!';
            }

            return formErrors;
        }
        , onSubmit: values => console.log( 'submit', values )
    } );

    console.log( values, errors );

    return (
        <div
            style={ {
                display: 'flex'
                , gap: '1rem'
            } }
        >
            <form
                onSubmit={ handleSubmit }
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
                    { errors.name }
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
                    />
                    { errors.email }
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
                    <button
                        type='button'
                        onClick={ () => resetForm() }
                    >Reset</button>
                    <button type='submit'>Submit</button>
                </div>
            </form>
            <pre>
                { JSON.stringify( values ) }
            </pre>
        </div>
    );
};

export default App;
