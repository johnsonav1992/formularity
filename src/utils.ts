import {
    DeepKeys
    , DeepValue
} from './utilityTypes';

const obj = {
    name: 'John'
    , address: {
        street: 'Some Street'
        , city: 'Some City'
        , country: 'Some Country'
    }
};

export const getViaPath = <
    TObj
    , TKey extends DeepKeys<TObj>
>( obj: TObj, path: TKey ): DeepValue<TObj, TKey> | undefined => {
    const keys = path.split( /\.|\[|\]/ ).filter( Boolean ) as Array<keyof TObj>;

    let current = obj;

    for ( const key of keys ) {
        if ( typeof current === 'object' && current !== null && key in current ) {
            current = current[ key ] as TObj;
        } else return undefined;
    }

    return current as DeepValue<TObj, TKey>;
};

export const setViaPath = <
    TObj
    , TPath extends DeepKeys<TObj>
    , TNewValue
    >(
        obj: TObj
        , path: TPath
        , newValue: TNewValue
    ): TObj => {
    const keys = path.split( /\.|\[|\]/ ).filter( Boolean ) as Array<keyof TObj>;
    const lastKey = keys.pop();

    let current = obj;

    for ( const key of keys ) {
        if ( typeof current[ key ] !== 'object' ) {
            current[ key ] = typeof keys[ 0 ] === 'number'
                ? [] as TObj[keyof TObj]
                : {} as TObj[keyof TObj];
        }
        current = current[ key ] as TObj;
    }

    if ( Array.isArray( current ) && lastKey === '' ) {
        current.push( newValue );
    } else {
        current[ lastKey as keyof TObj ] = newValue as TObj[keyof TObj];
    }

    return obj as TObj;
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
        if ( !valueProp || valueProp == 'true' || valueProp == 'false' ) return Boolean( checked );
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

export const objectKeys = <TObj extends object>( obj: TObj ) => Object.keys( obj ) as Array<keyof TObj>;

type ValueOf<T> = T[keyof T];
type Entries<T> = [keyof T, ValueOf<T>][];

export const objectEntries = <T extends object> ( obj: T ): Entries<T> => {
    return Object.entries( obj ) as Entries<T>;
};
