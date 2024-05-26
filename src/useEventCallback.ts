import {
    useCallback
    , useLayoutEffect
    , useRef
} from 'react';

type AnyFunction = ( ...args: unknown[] ) => void;

export const useEventCallback = <T extends AnyFunction>( fn: T ): T => {
    const ref = useRef<AnyFunction>( () => {} );

    useLayoutEffect( () => {
        ref.current = fn;
    } );

    return useCallback(
        ( ...args: unknown[] ) => ref.current?.apply( void 0, args )
        , []
    ) as T;
};
