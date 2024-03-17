// Libraries
import {
    SafeParseError
    , ZodSchema
} from 'zod';

// Types
import {
    FormErrors
    , FormValues
    , SingleFieldValidator
    , ValidationHandler
} from './types';
import { DeepKeys } from './utilityTypes';

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

export function zodAdapter<
    TSchemaInput
    , TFormValues extends FormValues = FormValues
>(
    schema: ZodSchema<TSchemaInput>
    , options?: { async?: boolean; isField?: never }
    ): ValidationHandler<TFormValues>;

export function zodAdapter<
    TSchemaInput
    , TFormValues extends FormValues = FormValues
    , TFieldName extends DeepKeys<TFormValues> = DeepKeys<TFormValues>
>(
    schema: ZodSchema<TSchemaInput>
    , options?: { async?: boolean; isField?: true }
): SingleFieldValidator<TFormValues, TFieldName>;

export function zodAdapter<
    TSchemaInput
    , TFormValues extends FormValues = FormValues
    , TFieldName extends DeepKeys<TFormValues> = DeepKeys<TFormValues>
> (
    schema: ZodSchema<TSchemaInput>
    , options?: { async?: boolean; isField?: true | never }
) {

    if ( !( schema instanceof ZodSchema ) ) {
        throw new Error( `You are trying to use a schema that is not a Zod 
            schema with this adapter. Please pass a correct Zod schema to fix this error` );
    }

    const isSingleFieldValidation = options?.isField;

    const handler = async ( valueOrValues: TFormValues | TSchemaInput ) => {
        const validationResult = await schema[
            options?.async
                ? 'safeParseAsync'
                : 'safeParse'
        ]( valueOrValues );

        if ( validationResult.success ) return null;

        return parseZodErrors( validationResult, isSingleFieldValidation );
    };

    if ( isSingleFieldValidation ) return handler as SingleFieldValidator<TFormValues, TFieldName>;

    return handler as ValidationHandler<TFormValues>;

}
