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
    } = useFormularity( {
        formStore
        , onSubmit: values => console.log( 'submit', values )
    } );

    console.log( values );

    return (
        <div
            style={ {
                display: 'flex'
                , flexDirection: 'column'
                , gap: '1rem'
            } }
        >
            <form onSubmit={ handleSubmit }>
                <input
                    name='name'
                    value={ values.name }
                    onBlur={ e => setFieldTouched( 'name', true ) }
                    onChange={ e => setFieldValue( 'name', e.target.value ) }
                />
                <input
                    name='email'
                    value={ values.email }
                    onChange={ handleChange }
                />
                <input
                    type='checkbox'
                    name='choice'
                    // checked={ values.choice }
                    value={ values.choice as unknown as string }
                    onChange={ handleChange }
                />
                <button type='submit'>Submit</button>
            </form>
        </div>
    );
};

export default App;
