import {
    useCallback
    , useLayoutEffect
    , useRef
} from 'react';

type AnyFunction = ( ...args: unknown[] ) => void;

export const useEventCallback = ( fn: AnyFunction ) => {
    const ref = useRef<AnyFunction>();

    useLayoutEffect( () => {
        ref.current = fn;
    } );

    return useCallback(
        ( ...args: unknown[] ) => ref.current?.apply( void 0, args )
        , []
    );
};
