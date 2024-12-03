// Utils
import {
    deepObjectKeys
    , setViaPath
} from './generalUtils';

// Types
import {
    FormErrors
    , FormTouched
    , FormValues
} from './types';
import { DeepPartial } from './utilityTypes';

export const touchAllFields = <TFormValues extends FormValues>( targetObj: TFormValues | DeepPartial<FormErrors<TFormValues>> ) => {
    return deepObjectKeys( targetObj )
        .reduce<FormTouched<TFormValues>>( ( touchedObj, key ) => {
            console.log( touchedObj );
            const newTouchedObj = setViaPath( touchedObj, key as never, true );

            return newTouchedObj;
        }, {} as FormTouched<TFormValues> );
};

export const getCheckboxValue = (
    currentValue: string | unknown[] | boolean,
    checked: boolean,
    valueProp: unknown
) => {
    if ( typeof currentValue === 'boolean' ) {
        return Boolean( checked );
    }

    let currentArrayOfValues: unknown[] = [];
    let isValueInArray = false;
    let index = -1;

    if ( !Array.isArray( currentValue ) ) {
        if (
            !valueProp
            || valueProp == 'true'
            || valueProp == 'false'
        ) return Boolean( checked );
    } else {
        currentArrayOfValues = currentValue;
        index = currentValue.indexOf( valueProp );
        isValueInArray = index >= 0;
    }

    if ( checked && valueProp && !isValueInArray ) return [ ...currentArrayOfValues, valueProp ];

    if ( !isValueInArray ) return currentArrayOfValues;

    return [
        ...currentArrayOfValues.slice( 0, index )
        , currentArrayOfValues.slice( index + 1 )
    ];
};

export const getMultiSelectValues = ( options: HTMLOptionsCollection ) => {
    return Array.from( options )
        .filter( option => option.selected )
        .map( option => option.value );
};
