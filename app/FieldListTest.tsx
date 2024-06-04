import { z } from 'zod';
import {
    Formularity
    , createFormStore
} from '../src';
import { zodAdapter } from 'formularity-zod-adapter';

type FormValues = {
    name: string
    ; hobbies: string[];
};

const validationSchema = zodAdapter( z.object( {
    name: z.string().min( 1, 'Name is required' )
    , hobbies: z.array( z.string().min( 1, 'Hobby name is required' ) )
} ) );

const formStore = createFormStore<FormValues>( {
    initialValues: {
        name: ''
        , hobbies: [ 'soccer' ]
    }
    , validationSchema
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
                        render={ ( hobbies, {
                            addField
                        } ) => {
                            return (
                                <>
                                    <label>Hobbies</label>
                                    {
                                        hobbies.map( ( _, idx ) => (
                                            <Field
                                                key={ idx }
                                                name={ `hobbies[${ idx }]` }
                                                showErrors
                                            />
                                        ) )
                                    }
                                    <button
                                        onClick={ () => addField( '' ) }
                                        type='button'
                                    >
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
