import { useState } from 'react';
import BasicTest from './BasicTest';
import FieldListTest from './FieldListTest';
import ValidatorsTest from './ValidatorsTest';

// Add new forms here
const forms = {
    basic: <BasicTest />
    , fieldList: <FieldListTest />
    , validators: <ValidatorsTest />
} as const;

const MainSwitcher = () => {
    const [ viewedForm, setViewedForm ] = useState<keyof typeof forms>( 'basic' );

    return (
        <div
            style={ {
                width: '100vw'
                , height: '100vh'
                , display: 'flex'
                , alignItems: 'center'
                , flexDirection: 'column'
                , gap: '2rem'
            } }
        >
            <h1>
                Formularity Testing
            </h1>
            <div
                style={ {
                    display: 'flex'
                    , flexDirection: 'column'
                    , alignItems: 'center'
                    , width: '100%'
                } }
            >
                <label htmlFor='switcher'>Pick a form</label>
                <select
                    name='switcher'
                    style={ { width: '25%' } }
                    onChange={ e => setViewedForm( e.target.value as keyof typeof forms ) }
                >
                    {
                        Object.keys( forms ).map( formName => {
                            return (
                                <option
                                    value={ formName }
                                    key={ formName }
                                >
                                    { formName }
                                </option>
                            );
                        } )
                    }
                </select>
            </div>
            <div
                style={ {
                    display: 'flex'
                    , width: '50%'
                } }
            >
                { forms[ viewedForm ] }
            </div>
        </div>
    );
};

export default MainSwitcher;
