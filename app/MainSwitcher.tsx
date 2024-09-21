import { useState } from 'react';
import BasicTest from './BasicTest';
import FieldListTest from './FieldListTest';

const MainSwitcher = () => {
    const [ viewedForm, setViewedForm ] = useState( 'Basic' );

    const renderForm = () => {
        switch ( viewedForm ) {
            case 'Basic': return <BasicTest />;
            case 'FieldList': return <FieldListTest />;
            default: return null;
        }
    };

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
                    onChange={ e => setViewedForm( e.target.value ) }
                >
                    <option value='Basic'>Basic</option>
                    <option value='FieldList'>FieldList</option>
                </select>
            </div>
            <div
                style={ {
                    display: 'flex'
                    , width: '50%'
                } }
            >
                { renderForm() }
            </div>
        </div>
    );
};

export default MainSwitcher;
