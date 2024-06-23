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
            const newTouchedObj = setViaPath( touchedObj, key as never, true );

            return newTouchedObj;
        }, {} as FormTouched<TFormValues> );
};
