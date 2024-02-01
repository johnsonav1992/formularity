import {
    createFormStore
    , useFormularity
} from '../src';
import { Field } from '../src/Field';
import { Formularity } from '../src/Formularity';

const initialValues = {
    name: ''
    , email: ''
    , choice: false
};

const formStore = createFormStore( initialValues );

const AnotherTest = () => {
    const formularity = useFormularity( { formStore } );

    console.log( formularity.values );

    return (
        <div>
            <Formularity formStore={ formStore }>
                <Field
                    name='name'
                    type=''
                />
                <Field
                    name='email'
                    type=''
                />
                <Field
                    name='choice'
                    type='checkbox'
                />
            </Formularity>
        </div>
    );
};

export default AnotherTest;
