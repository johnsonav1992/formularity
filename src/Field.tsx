import React, {
    HTMLInputTypeAttribute
    , ReactElement
    , ReactNode
} from 'react';
import {
    FormStore
    , FormValues
} from './types/types';
import { useFormularity } from './useFormularity';
import { getViaPath } from './utils';

type Props<TFormValues extends FormValues> = {
    name: keyof TFormValues | ( string & {} );
    formStore?: FormStore<TFormValues>;
    value?: unknown;
    type?: HTMLInputTypeAttribute | ( string & {} ) | undefined ;
    checked?: boolean;
    component?: ReactNode;
};

export const Field = <TFormValues extends FormValues>( {
    name
    , formStore
    , value
    , type
    , checked
    , component
}: Props<TFormValues> ) => {
    if ( !formStore ) throw new Error( `Must use <Field /> 
    component within a <Formularity /> component or 
    explicitly pass a form store as a prop!` );

    const formularity = useFormularity( { formStore } );

    const renderedComponent = component || 'input';

    const fieldProps = {
        name
        , value: value || getViaPath( formularity.values, name )
        , checked: type === 'checkbox'
            ? value == undefined
                ? checked
                : !!getViaPath( formularity.values, name )
            : undefined
        , onChange: formularity.handleChange
        , onBlur: formularity.handleBlur
        , type: type || 'text'
    };

    return (
        React.createElement( renderedComponent as ReactElement, { ...fieldProps } )
    );
};
