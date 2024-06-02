import {
    Formularity
    , createFormStore
} from '../src';

type FormValues = {
    name: string
    ; hobbies: string[];
};

const formStore = createFormStore<FormValues>( {
    initialValues: {
        name: ''
        , hobbies: []
    }
} );

const FieldListTest = () => {
    return (
        <Formularity
            formStore={ formStore }
            onSubmit={ values => console.log( values ) }
        >
            { ( {
                Field
                , FieldList
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
                        name='name'
                        label='Name'
                    />
                    <FieldList
                        name='hobbies'
                        render={ ( hobbies, { addField } ) => {
                            return (
                                <>
                                    {
                                        hobbies.map( ( _, idx ) => (
                                            <>
                                                <Field
                                                    name={ `hobbies[${ idx }]` }
                                                    key={ idx }
                                                />
                                            </>
                                        ) )
                                    }
                                    <button onClick={ () => addField( '' ) }>
                                        Add Hobby
                                    </button>
                                </>
                            );
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

export default FieldListTest;
