import { z } from 'zod';
import {
    Formularity
    , createFormStore
} from '../src';
import { zodAdapter } from 'formularity-zod-adapter';

type Widget = {
    id: number | '';
    name: string;
};

type FormValues = {
    name: string;
    hobbies: string[];
    widgets: Array<Widget>;
};

const validationSchema = zodAdapter<FormValues>( z.object( {
    name: z.string().min( 1, 'Name is required' )
    , hobbies: z.array( z.string().min( 1, 'Hobby is required' ) )
    , widgets: z.array( z.object( {
        id: z.number( { invalid_type_error: 'Must be a number' } )
            .gte( 0, 'Must be 0 or greater' )
        , name: z.string().min( 1, 'Name is required' )
    } ) )
} ) );

const formStore = createFormStore<FormValues>( {
    initialValues: {
        name: ''
        , hobbies: [ 'soccer' ]
        , widgets: []
    }
    , validationSchema
} );

const FieldListTest = () => {
    return (
        <Formularity
            formStore={ formStore }
            onSubmit={ values => console.log( values ) }
            formProps={ { style: { width: '100%' } } }
        >
            { ( {
                Field
                , FieldList
                , SubmitButton
                , ResetButton
            } ) => (
                <div
                    style={ {
                        width: '100%'
                        , display: 'flex'
                        , flexDirection: 'column'
                        , gap: '.5rem'
                    } }
                >
                    <Field
                        name='name'
                        label='Name'
                        showErrors
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
                    <FieldList
                        name='widgets'
                        render={ ( widgets, {
                            addField
                            , removeField
                        } ) => {
                            return (
                                <>
                                    <label>Widgets</label>
                                    {
                                        widgets?.map( ( _, idx ) => (
                                            <div key={ idx }>
                                                <label>Id</label>
                                                <Field
                                                    type='number'
                                                    name={ `widgets[${ idx }].id` }
                                                    showErrors
                                                />
                                                <label>Name</label>
                                                <Field
                                                    name={ `widgets[${ idx }].name` }
                                                    showErrors
                                                />
                                                <button
                                                    type='button'
                                                    onClick={ () => removeField( idx ) }
                                                >
                                                    -
                                                </button>
                                            </div>
                                        ) )
                                    }
                                    <button
                                        type='button'
                                        onClick={ () => addField( {
                                            id: ''
                                            , name: ''
                                        } ) }
                                    >
                                        Add Widget
                                    </button>
                                </>
                            );
                        } }
                    />
                    { /* <SubmitButton style={ { height: '40px' } }>
                        Submit
                    </SubmitButton>
                    <ResetButton>
                        Reset
                    </ResetButton> */ }
                </div>
            ) }
        </Formularity>
    );
};

export default FieldListTest;
