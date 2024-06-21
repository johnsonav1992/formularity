import {
    useEffect
    , useRef
} from 'react';

const useRenderLogger = ( componentName: string ) => {
    const renderCount = useRef( 0 );

    useEffect( () => {
        renderCount.current += 1;
        console.log( `${ componentName } rendered ${ renderCount.current } times` );
    } );
};

export default useRenderLogger;
