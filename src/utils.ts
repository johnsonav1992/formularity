// Libraries
import toPath from 'lodash/toPath';

export const getViaPath = (
    obj: unknown,
    key: string | string[],
    def?: unknown,
    p: number = 0
) => {
    const path = toPath( key );
    while ( obj && p < path.length ) {
        obj = obj[ path[ p++ ] as keyof typeof obj ];
    }

    if ( p !== path.length && !obj ) {
        return def;
    }

    return obj === undefined ? def : obj;
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
