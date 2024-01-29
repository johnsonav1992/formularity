import { useFormularity } from '../src/useFormularity';
import { createFormStore } from '../src/createFormStore';

const formStore = createFormStore( {
    name: ''
    , email: ''
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
    } = useFormularity( {
        formStore
        , onSubmit: values => console.log( 'submit', values )
    } );

    console.log( initialValues, values, 'isDirty - ', isDirty );

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
                    onChange={ e => setFieldValue( 'name', e.target.value ) }
                />
                <input
                    name='email'
                    value={ values.email }
                    onChange={ e => setFieldValue( 'email', e.target.value ) }
                />
                { /* <input
                    type='checkbox'
                    name='choice'
                    checked={ values.choice }
                    // value={ values.choice as unknown as string }
                    onChange={ handleChange }
                /> */ }
                <button type='submit'>Submit</button>
            </form>
        </div>
    );
};

export default App;
