// export const zodAdapter

import {
    SafeParseError
    , ZodSchema
    , z
} from 'zod';
import {
    FormErrors
    , FormValues
} from './types';

export const parseZodErrors = <T = Record<string, unknown>>( errorObj: SafeParseError<T> ) => {
    const flattenedZodErrors = errorObj.error.flatten();
    const fieldErrors = flattenedZodErrors.fieldErrors;

    const formErrors: FormErrors<FormValues> = {};

    let fieldError: keyof typeof fieldErrors;

    for ( fieldError in fieldErrors ) {
        formErrors[ fieldError ] = fieldErrors[ fieldError ]?.join( ',' );
    }

    return formErrors;
};

export const zodAdapter = ( schema: unknown ) => {
    if ( schema instanceof ZodSchema ) return schema;

    return null;
};

const schema = z.object( {
    name: z.string()
} );

const res = zodAdapter( schema );
