import React, {
    FC
    , HTMLInputTypeAttribute
    , ReactNode
} from 'react';

// Types
import {
    FormErrors
    , FormStore
    , FormTouched
    , FormValues
    , UseFormularityReturn
} from './types/types';

// Utils
import { getViaPath } from './utils';

// Components
import { ConditionalWrapper } from './ConditionalWrapper';

// Hooks
import { useFormularity } from './useFormularity';

type BaseProps<TFormValues extends FormValues> = {
    name: keyof TFormValues | ( string & {} );
    formularity?: UseFormularityReturn<TFormValues>;
    formStore?: FormStore<TFormValues>;
    value?: unknown;
    type?: HTMLInputTypeAttribute | ( string & {} ) | undefined ;
    checked?: boolean;
    component?: ReactNode;
    showErrors?: boolean;
};

type Props<TFormValues extends FormValues> = BaseProps<TFormValues>;

export const Field = <TFormValues extends FormValues>( {
    name
    , formularity
    , formStore
    , value
    , type
    , checked
    , component
    , showErrors
}: Props<TFormValues> ) => {
    if ( !formularity ) throw new Error(
        `Must use <Field /> 
        component within a <Formularity /> component or 
        explicitly pass a form store as a prop!`
    );

    const renderedComponent = component || 'input';

    const formularityProps = formStore ? useFormularity( { formStore } ) : formularity;

    const fieldProps = {
        name
        , value: value || getViaPath( formularityProps.values, name as string )
        , checked: type === 'checkbox'
            ? value == undefined
                ? checked
                : !!getViaPath( formularityProps.values, name as string )
            : undefined
        , onChange: formularityProps.handleChange
        , onBlur: formularityProps.handleBlur
        , type: type || 'text'
    };

    const error = formularityProps.errors[ name as keyof FormErrors<TFormValues> ];
    const touched = formularityProps.touched[ name as keyof FormTouched<TFormValues> ];

    return (
        <ConditionalWrapper
            condition={ showErrors }
            wrapper={ children => (
                <div>
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
            { React.createElement<typeof fieldProps>( renderedComponent as unknown as FC, fieldProps ) }
        </ConditionalWrapper>
    );
};
