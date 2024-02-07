import {
    SafeParseError
    , ZodSchema
} from 'zod';
import {
    FormErrors
    , FormValues
    , ValidationHandler
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

export const zodAdapter = <TFormValues extends FormValues>(
    schema: ZodSchema<TFormValues>
): ValidationHandler<TFormValues> => {
    if ( !( schema instanceof ZodSchema ) ) {
        throw new Error( `You are trying to use a schema that is not a Zod 
            schema with this adapter. Please pass a correct Zod schema to fix this error` );
    }

    return values => {
        const validationResult = schema.safeParse( values );

        if ( validationResult.success ) return null;

        return parseZodErrors( validationResult );
    };

};
