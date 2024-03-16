// Libraries
import {
    SafeParseError
    , ZodObject
    , ZodSchema
} from 'zod';

// Types
import {
    FormErrors
    , FormValues
    , SingleFieldValidator
    , ValidationHandler
} from './types';

export const parseZodErrors = <
    T extends SafeParseError<TFormValues>
    , TFormValues extends FormValues = FormValues
>( errorObj: T, singleFieldValidation?: boolean ) => {
    const flattenedZodErrors = errorObj.error.flatten();
    const fieldErrors = flattenedZodErrors[ singleFieldValidation ? 'formErrors' : 'fieldErrors' ];

    //just return all field errors for the single field -> for singleFieldValidators
    if ( Array.isArray( fieldErrors ) ) return fieldErrors.join( ',' );

    const formErrors: FormErrors<TFormValues> = {};

    for ( const fieldError in fieldErrors ) {
        //@ts-expect-error -> TS can't wrap its head around setting properties to this empty object
        formErrors[ fieldError ] = fieldErrors[ fieldError as keyof typeof fieldErrors ]?.join( ',' );
    }

    return formErrors as FormErrors<TFormValues>;
};

export const zodAdapter = <TSchema = FormValues>(
    schema: ZodSchema<TSchema>
    , options?: { async?: boolean }
): ValidationHandler<FormValues> | SingleFieldValidator<FormValues> => {
    if ( !( schema instanceof ZodSchema ) ) {
        throw new Error( `You are trying to use a schema that is not a Zod 
            schema with this adapter. Please pass a correct Zod schema to fix this error` );
    }

    const isSingleFieldValidation = !( schema instanceof ZodObject );

    const parseErrors = async ( valueOrValues: TSchema ) => {
        const validationResult = await schema[
            options?.async
                ? 'safeParseAsync'
                : 'safeParse'
        ]( valueOrValues );

        if ( validationResult.success ) return null;

        return parseZodErrors( validationResult, isSingleFieldValidation );
    };

    const singleFieldValidator = ( value => parseErrors( value ) ) as SingleFieldValidator<FormValues>;
    const validationHandler = ( values => parseErrors( values as TSchema ) ) as ValidationHandler<FormValues>;

    if ( isSingleFieldValidation ) return singleFieldValidator;

    return validationHandler;

};
