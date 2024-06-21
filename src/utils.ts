// Types
import {
    DeepKeys
    , DeepPartial
    , DeepValue
    , Entries
} from './utilityTypes';

export const objectKeys = <TObj extends object>( obj: TObj ) => Object.keys( obj ) as Array<keyof TObj>;

export const isObject = ( item: unknown ): item is object => {
    return !!item
        && typeof item === 'object'
        && !Array.isArray( item );
};

export const objectEntries = <T extends object>( obj: T ): Entries<T> => {
    return Object.entries( obj ) as Entries<T>;
};

export const deepObjectKeys = <TObj>( obj: TObj ): DeepKeys<TObj>[] => {
    const keys: DeepKeys<TObj>[] = [];

    const getDeepKeys = ( currentObj: TObj, path: string ) => {
        if ( typeof currentObj !== 'object' || currentObj === null ) return;

        for ( const key in currentObj ) {
            if ( Object.prototype.hasOwnProperty.call( currentObj, key ) ) {
                const fullPath = path ? `${ path }.${ key }` : key;

                keys.push( fullPath as DeepKeys<TObj> );

                if ( Array.isArray( currentObj[ key ] ) ) {
                    ( currentObj[ key ] as unknown[] )
                        .forEach( ( item: unknown, index: number ) => {
                            const arrayPath = `${ fullPath }[${ index }]`;

                            keys.push( arrayPath as DeepKeys<TObj> );
                            getDeepKeys( item as TObj, arrayPath );
                        } );
                } else if ( typeof currentObj[ key ] === 'object' ) {
                    getDeepKeys( currentObj[ key ] as TObj, fullPath );
                }
            }
        }
    };

    getDeepKeys( obj, '' );

    return keys;
};

export const getKeysWithDiffs = <TObj, TCompareObj>( obj: TObj, obj2: TCompareObj ): DeepKeys<TObj>[] => {
    const allKeys = deepObjectKeys( obj );

    const keysWithDiffs = allKeys.filter( key => {
        const objValue = getViaPath( obj, key );
        const initialValue = getViaPath( obj2, key as never );

        return !isEqual( objValue, initialValue );
    } );

    return keysWithDiffs;
};

export const hasSameNestedKeys = <T, U>( obj1: T, obj2: U ) => {
    const countNestedKeys = <TObj>( obj: TObj ): number => {
        let count = 0;

        for ( const key in obj ) {
            if ( Array.isArray( obj[ key ] ) ) {
                for ( const item of obj[ key ] as unknown[] ) {
                    if ( typeof item === 'object' ) {
                        count += countNestedKeys( item );
                    } else {
                        count++;
                    }
                }
            } else if ( typeof obj[ key ] === 'object' ) {
                count += 1 + countNestedKeys( obj[ key ] );
            } else {
                count++;
            }
        }
        return count;
    };

    return countNestedKeys( obj1 ) === countNestedKeys( obj2 );
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
        if ( Array.isArray( current ) ) {
            const index = parseInt( key as string, 10 );

            if ( isNaN( index ) ) return undefined;

            current = current[ index ];
        } else if (
            typeof current === 'object'
            && current !== null
            && key in current
        ) {
            current = current[ key ] as TObj;
        } else {
            return undefined;
        }
    }

    return current as DeepValue<TObj, TKey>;
};

export const setViaPath = <
        TObj,
        TPath extends string,
        TNewValue
    >(
        obj: TObj,
        path: TPath,
        newValue: TNewValue
    ): TObj => {
    const keys = path.split( /\.\[|\]|\./ ).filter( Boolean ) as Array<keyof TObj>;
    const newObj = cloneDeep( obj );
    let current = newObj as TObj;

    for ( let i = 0; i < keys.length - 1; i++ ) {
        const key = keys[ i ];

        if (
            typeof current[ key ] !== 'object'
            || current[ key ] === null
        ) {
            current[ key ] = isNaN( Number( keys[ i + 1 ] ) )
                ? {} as never
                : [] as never;
        }

        current = current[ key ] as TObj;
    }

    current[ keys[ keys.length - 1 ] ] = newValue as never;

    return newObj as TObj;
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

export const deepMerge = <TObj>( target: TObj, source: DeepPartial<TObj> ): TObj => {
    if ( !isObject( target ) || !isObject( source ) ) {
        return source as TObj;
    }

    const output = cloneDeep( target ) as TObj;
    for ( const key in source ) {
        if ( Object.prototype.hasOwnProperty.call( source, key ) ) {
            if ( isObject( source[ key ] ) && key in target ) {
                output[ key ] = deepMerge( target[ key ], source[ key as never ] );
            } else {
                ( output[ key ] as unknown ) = source[ key ];
            }
        }
    }

    return output;
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

export const getActiveElement = ( doc?: Document ) => {
    doc = doc || ( typeof document !== 'undefined' ? document : undefined );
    if ( typeof doc === 'undefined' ) return null;

    try {
        return doc.activeElement || doc.body;
    } catch ( e ) {
        return doc.body;
    }
};

export const logDevWarning = ( msg: string ) => {
    if ( process.env.NODE_ENV === 'development' ) {
        console.warn( msg );
    }
};
