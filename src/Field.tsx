import React, {
    HTMLInputTypeAttribute
    , ReactElement
    , ReactNode
} from 'react';
import {
    FormErrors
    , FormStore
    , FormTouched
    , FormValues
    , ManualValidationHandler
} from './types/types';
import { useFormularity } from './useFormularity';
import { getViaPath } from './utils';
import { ConditionalWrapper } from './ConditionalWrapper';

type BaseProps<TFormValues extends FormValues> = {
    name: keyof TFormValues | ( string & {} );
    formStore?: FormStore<TFormValues>;
    manualValidationHandler?: ManualValidationHandler<TFormValues>;
    value?: unknown;
    type?: HTMLInputTypeAttribute | ( string & {} ) | undefined ;
    checked?: boolean;
    component?: ReactNode;
    showErrors?: boolean;
};

type Props<TFormValues extends FormValues> = BaseProps<TFormValues>;

export const Field = <TFormValues extends FormValues>( {
    name
    , formStore
    , manualValidationHandler
    , value
    , type
    , checked
    , component
    , showErrors
}: Props<TFormValues> ) => {
    if ( !formStore ) throw new Error( `Must use <Field /> 
    component within a <Formularity /> component or 
    explicitly pass a form store as a prop!` );

    const formularity = useFormularity( {
        formStore
        , manualValidationHandler
    } );

    const renderedComponent = component || 'input';

    const fieldProps = {
        name
        , value: value || getViaPath( formularity.values, name as string )
        , checked: type === 'checkbox'
            ? value == undefined
                ? checked
                : !!getViaPath( formularity.values, name as string )
            : undefined
        , onChange: formularity.handleChange
        , onBlur: formularity.handleBlur
        , type: type || 'text'
    };

    const error = formularity.errors[ name as keyof FormErrors<TFormValues> ];
    const touched = formularity.touched[ name as keyof FormTouched<TFormValues> ];

    return (
        <ConditionalWrapper
            condition={ showErrors }
            wrapper={ children => (
                <div
                    style={ {
                        display: 'flex'
                        , flexDirection: 'column'
                        , gap: '.5rem'
                    } }
                >
                    { children }
                    {
                        error
                        && touched
                        && (
                            <div>
                                { error }
                            </div>
                        )
                    }
                </div>
            ) }
        >
            { React.createElement( renderedComponent as ReactElement, { ...fieldProps } ) }
        </ConditionalWrapper>
    );
};
