// Types
import {
    DeepKeys
    , DeepValue
} from './utilityTypes';

export const objectKeys = <TObj extends object>( obj: TObj ) => obj && Object.keys( obj ) as Array<keyof TObj>;

type ValueOf<T> = T[keyof T];
type Entries<T> = [keyof T, ValueOf<T>][];

export const objectEntries = <T extends object> ( obj: T ): Entries<T> => {
    return obj && Object.entries( obj ) as Entries<T>;
};

export const getViaPath = <
    TObj
    , TKey extends DeepKeys<TObj>
>( obj: TObj, path: TKey ): DeepValue<TObj, TKey> | undefined => {
    const keys = path
        .split( /\.|\[|\]/ )
        .filter( Boolean ) as Array<keyof TObj>;

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
    const keys = path
        .split( /\.|\[|\]/ )
        .filter( Boolean ) as Array<keyof TObj>;

    const lastKey = keys.pop();

    let current = obj;

    for ( const key of keys ) {
        if ( typeof current[ key ] !== 'object' ) {
            current[ key ] = typeof keys[ 0 ] === 'number'
                ? [] as never
                : {} as never;
        }
        current = current[ key ] as TObj;
    }

    if ( Array.isArray( current ) && lastKey === '' ) {
        current.push( newValue );
    } else {
        current[ lastKey as keyof TObj ] = newValue as never;
    }

    return obj as TObj;
};

export const isEqual = <TVal1, TVal2>( value: TVal1, other: TVal2 ) => {

    const deepEqual = ( a: TVal1, b: TVal2 ) => {
        if ( a as never === b as never ) return true;

        if (
            typeof a !== 'object'
            || typeof b !== 'object'
            || a === null
            || b === null
        ) return false;

        const keysA = objectKeys( a );
        const keysB = objectKeys( b );

        if ( keysA.length !== keysB.length ) return false;

        for ( const key of keysA ) {
            if (
                !keysB.includes( key as never )
                || !deepEqual( a[ key as never ], b[ key as never ] )
            ) return false;
        }

        return true;
    };

    return deepEqual( value, other );
};

export const isEmpty = <TVal>( value: TVal ) => {
    if ( value == null ) return true;

    if (
        typeof value === 'object'
        || typeof value === 'string'
        || Array.isArray( value )
    ) return objectKeys( value as never ).length === 0;

    return false;
};

export const cloneDeep = <TObj>( obj: TObj, clonedObjects = new WeakMap() ): TObj => {
    if ( obj === null || typeof obj !== 'object' ) return obj;

    if ( clonedObjects.has( obj ) ) return clonedObjects.get( obj );

    const clone = Array.isArray( obj ) ? [] : {};

    clonedObjects.set( obj, clone );

    if ( Array.isArray( obj ) ) {
        for ( let i = 0; i < obj.length; i++ ) {
            ( clone as unknown[] )[ i ] = cloneDeep( obj[ i ], clonedObjects );
        }
    } else {
        for ( const key in obj ) {
            if ( key in obj ) {
                ( clone as TObj )[ key ] = cloneDeep( obj[ key ], clonedObjects );
            }
        }
    }

    return clone as TObj;
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
