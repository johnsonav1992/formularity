import { useCallback } from 'react';

// Types
import {
    FormStore
    , FormStoreState
    , FormValues
    , FieldValidationOptions
    , NewFieldRegistration
    , FieldRegistry
    , FormErrors
    , FormTouched
    , SingleFieldValidator
    , ValidationHandler
    , FieldEffectHelpers
    , FieldEffectFn
} from './types';
import {
    DeepKeys
    , DeepPartial
    , DeepValue
    , OnChangeEvent
    , OnBlurEvent
    , CheckboxValue
    , Nullish
} from './utilityTypes';

// Utils
import {
    getViaPath
    , setViaPath
    , isEqual
    , logDevWarning
    , getFieldEffectFns
    , objectEntries
} from './generalUtils';
import {
    getCheckboxValue
    , getMultiSelectValues
} from './formUtils';

// Hooks
import { useEventCallback } from './useEventCallback';

/**
 * Hook that provides field handlers without causing rerenders.
 * These handlers are stable and only read from/write to the store when called.
 */
export const useFieldHandlers = <TFormValues extends FormValues>(
    formStore: FormStore<TFormValues>
    , fieldRegistryRef: React.MutableRefObject<FieldRegistry<TFormValues>>
    , validateOnChange: boolean
    , validateOnBlur: boolean
    , validationSchema?: ValidationHandler<TFormValues>
    , manualValidationHandler?: ValidationHandler<TFormValues>
) => {
    const registerField = useCallback(
        <TFieldName extends DeepKeys<TFormValues>>(
            newFieldRegistration: NewFieldRegistration<TFormValues, TFieldName>
        ) => {
            const {
                name
                , ...fieldRegistryProps
            } = newFieldRegistration;

            if ( fieldRegistryRef.current[ name ] ) return;

            fieldRegistryRef.current[ name ]
                = { ...fieldRegistryProps } as FieldRegistry<TFormValues>[TFieldName];
        }
        , [ fieldRegistryRef ]
    );

    const unregisterField = useCallback(
        <TFieldName extends DeepKeys<TFormValues>>( fieldName: TFieldName ) => {
            delete fieldRegistryRef.current[ fieldName ];
        }
        , [ fieldRegistryRef ]
    );

    const runSingleFieldValidations = useEventCallback( async <TFieldName extends DeepKeys<TFormValues>>(
        fieldValidators: SingleFieldValidator<TFormValues, TFieldName> | Array<SingleFieldValidator<TFormValues, TFieldName>>
        , fieldName: TFieldName
        , values: TFormValues
    ) => {
        const fieldValue = getViaPath( values, fieldName );

        let fieldErrorsOrNull: string | Nullish = null;

        if ( Array.isArray( fieldValidators ) ) {
            for ( const validator of fieldValidators ) {
                const newErrorOrNull = await validator( fieldValue!, {
                    fieldName
                    , formValues: values
                } );

                if ( newErrorOrNull ) {
                    fieldErrorsOrNull = [ fieldErrorsOrNull, newErrorOrNull ]
                        .filter( Boolean )
                        .join( ', ' );
                }
            }
        } else {
            fieldErrorsOrNull = await fieldValidators( fieldValue!, {
                fieldName
                , formValues: values
            } );
        }

        return fieldErrorsOrNull;
    } );

    const runAllSingleFieldValidators = useEventCallback( async (
        errors: DeepPartial<FormErrors<TFormValues>>
        , values: TFormValues
    ) => {
        for ( const [ fieldName, registration ] of objectEntries( fieldRegistryRef.current ) ) {
            const fieldErrorOrNull = registration?.validationHandlers
                ? await runSingleFieldValidations( registration?.validationHandlers, fieldName, values )
                : null;

            if ( fieldErrorOrNull ) {
                errors = setViaPath(
                    errors,
                    fieldName as DeepKeys<DeepPartial<FormErrors<TFormValues>>>
                    , fieldErrorOrNull
                );
            }
        }

        return errors;
    } );

    const _validate = useEventCallback( async (
        values: TFormValues,
        options?: { updateStore?: boolean }
    ) => {
        const updateStore = options?.updateStore ?? true;
        const currentStore = formStore.get();
        const errors = currentStore.errors;

        let newErrors: DeepPartial<FormErrors<TFormValues>> = {};

        const singleValidatorKeys = objectEntries( fieldRegistryRef.current )
            .filter( ( [ _, registration ] ) => !!registration?.validationHandlers )
            .map( ( [ key ] ) => key );

        const validationRunner = async ( validationHandlerToRun?: ValidationHandler<TFormValues> ) => {
            const validationErrors = await validationHandlerToRun?.( values );

            if ( validationErrors ) {
                newErrors = validationErrors;
            }

            if ( singleValidatorKeys.length ) {
                for ( const error in newErrors ) {
                    if ( singleValidatorKeys.includes( error as DeepKeys<TFormValues> ) ) {
                        delete newErrors[ error as keyof Partial<FormErrors<TFormValues>> ];
                    }
                }

                newErrors = await runAllSingleFieldValidators( newErrors, values );
            }

            // If the errors haven't changed, skip render cycle and just return the errors
            if ( isEqual( newErrors, errors ) ) return;

            updateStore && formStore.set( { errors: newErrors as FormErrors<TFormValues> } );
        };

        switch ( true ) {
            case !!validationSchema: await validationRunner( validationSchema );
                break;
            case !!manualValidationHandler: await validationRunner( manualValidationHandler );
                break;
            default: await validationRunner();
        }

        return newErrors;
    } );

    const validateField = useEventCallback( async <TFieldName extends DeepKeys<TFormValues>>(
        fieldName: TFieldName
        , options?: {
            validators?: SingleFieldValidator<TFormValues, TFieldName> | Array<SingleFieldValidator<TFormValues, TFieldName>>;
            shouldTouchField?: boolean;
        }
    ) => {
        const currentStore = formStore.get();
        const validator = options?.validators;
        const shouldTouchField = options?.shouldTouchField ?? true;

        const validatorToRun
                = validator
                || fieldRegistryRef.current?.[ fieldName as keyof FieldRegistry<TFormValues> ]?.validationHandlers as typeof validator;

        if ( !validatorToRun ) {
            logDevWarning(
                `Field: ${ fieldName } must have a validator prop set or ' +
                'an inline validator must be passed as a second argument in order to use validateField.`
            );

            return null;
        }

        const errorOrNull = await runSingleFieldValidations( validatorToRun, fieldName, currentStore.values );
        const newTouched = shouldTouchField ? setViaPath( currentStore.touched, fieldName, true ) : currentStore.touched;
        const newErrors = errorOrNull ? setViaPath( currentStore.errors, fieldName, errorOrNull ) : currentStore.errors;

        formStore.set( {
            touched: newTouched
            , errors: newErrors
        } );

        return errorOrNull;
    } );

    const setFieldValue = useEventCallback( <TFieldName extends DeepKeys<TFormValues>>(
        fieldName: TFieldName
        , newValue: DeepValue<TFormValues, TFieldName>
        , options?: FieldValidationOptions
    ) => {
        const currentStore = formStore.get();
        const shouldValidate = options?.shouldValidate !== undefined
            ? options.shouldValidate
            : validateOnChange;

        const validationEvent = options?.validationEvent ?? 'all';

        const newValues = setViaPath( currentStore.values, fieldName, newValue );

        const runFieldEffects = (
            newErrors: DeepPartial<FormErrors<TFormValues>> | FormErrors<TFormValues>,
            newValues: TFormValues,
            touched: FormTouched<TFormValues>
        ) => {
            const fieldEffects = getFieldEffectFns( fieldRegistryRef.current, fieldName as never, 'change' );

            if ( fieldEffects ) {
                fieldEffects.forEach( ( [ targetFieldName, effect ] ) => {
                    const fieldEffect = effect as FieldEffectFn<TFormValues, DeepKeys<TFormValues>, DeepKeys<TFormValues>>;
                    const listenFieldName = fieldName;

                    const listenFieldVal = getViaPath( newValues, listenFieldName );
                    const targetFieldVal = getViaPath( newValues, targetFieldName )!;

                    const helpers: FieldEffectHelpers<TFormValues, DeepKeys<TFormValues>> = {
                        setValue: val => {
                            newValues = setViaPath( newValues, targetFieldName, val );
                            formStore.set( { values: newValues } );
                        }
                        , setError: error => {
                            const newFieldErrors = setViaPath(
                                newErrors as FormErrors<TFormValues>,
                                targetFieldName,
                                error
                            );

                            formStore.set( { errors: newFieldErrors } );
                        }
                        , setTouched: tchd => {
                            const newTouched = setViaPath(
                                touched,
                                targetFieldName,
                                tchd
                            );

                            formStore.set( { touched: newTouched } );
                        }
                        , validateField: async ( touchField, customValidator ) => {
                            await validateField( targetFieldName, {
                                validators: customValidator || undefined
                                , shouldTouchField: !!touchField
                            } );
                        }
                    };

                    fieldEffect(
                        listenFieldVal,
                        targetFieldVal,
                        helpers
                    );
                } );
            }
        };

        formStore.set( { values: newValues } );

        if ( shouldValidate ) {
            switch ( validationEvent ) {
                case 'all':
                case 'onChange': {
                    _validate( newValues )
                        .then( newErrors => runFieldEffects( newErrors, newValues, currentStore.touched ) );
                    break;
                }
                case 'onBlur': break;
            }
        } else {
            runFieldEffects( currentStore.errors, newValues, currentStore.touched );
        }
    } );

    const setFieldTouched = useEventCallback( async (
        fieldName: DeepKeys<TFormValues>
        , newTouched: boolean
        , fieldValidationOptions?: FieldValidationOptions
    ) => {
        const currentStore = formStore.get();
        const newFieldTouched = setViaPath(
            currentStore.touched
            , fieldName as DeepKeys<FormTouched<TFormValues>>
            , newTouched
        );

        const fieldValidationEvent = fieldValidationOptions?.validationEvent || 'all';
        const shouldValidateFieldOnBlur
            = fieldValidationEvent === 'onBlur'
            || fieldValidationEvent === 'all'
            || validateOnBlur;

        const newErrors = shouldValidateFieldOnBlur
            ? await _validate( currentStore.values, { updateStore: false } )
            : currentStore.errors;

        formStore.set( {
            touched: newFieldTouched
            , errors: newErrors as FormErrors<TFormValues>
        } );

        const runFieldEffects = (
            newErrors: DeepPartial<FormErrors<TFormValues>>,
            newValues: TFormValues,
            touched: FormTouched<TFormValues>,
        ) => {
            const fieldEffects = getFieldEffectFns( fieldRegistryRef.current, fieldName as never, 'blur' );

            if ( fieldEffects ) {
                fieldEffects.forEach( ( [ targetFieldName, effect ] ) => {
                    const fieldEffect = effect as FieldEffectFn<TFormValues, DeepKeys<TFormValues>, DeepKeys<TFormValues>>;
                    const listenFieldName = fieldName;

                    const listenFieldVal = getViaPath( newValues, listenFieldName );
                    const targetFieldVal = getViaPath( newValues, targetFieldName )!;

                    const helpers: FieldEffectHelpers<TFormValues, DeepKeys<TFormValues>> = {
                        setValue: val => {
                            newValues = setViaPath( newValues, targetFieldName, val );
                            formStore.set( { values: newValues } );
                        }
                        , setError: error => {
                            const newFieldErrors = setViaPath(
                                newErrors as FormErrors<TFormValues>,
                                targetFieldName,
                                error
                            );

                            formStore.set( { errors: newFieldErrors } );
                        }
                        , setTouched: tchd => {
                            const newTouched = setViaPath(
                                touched,
                                targetFieldName,
                                tchd
                            );

                            formStore.set( { touched: newTouched } );
                        }
                        , validateField: async ( touchField, customValidator ) => {
                            await validateField( targetFieldName, {
                                validators: customValidator || undefined
                                , shouldTouchField: !!touchField
                            } );
                        }
                    };

                    fieldEffect(
                        listenFieldVal,
                        targetFieldVal,
                        helpers
                    );
                } );
            }
        };

        runFieldEffects( newErrors as never, currentStore.values, newFieldTouched );
    } );

    const handleChange = useEventCallback( (
        e: OnChangeEvent
        , fieldValidationOptions?: FieldValidationOptions
    ) => {
        const currentStore = formStore.get();
        let finalValue;

        const fieldName = e.target.name as DeepKeys<TFormValues>;
        const {
            value
            , type
        } = e.target;

        const {
            options
            , multiple
        } = e.target as HTMLSelectElement;

        const { checked } = e.target as HTMLInputElement;

        switch ( true ) {
            case /number|range/.test( type ): {
                const parsedValue = parseFloat( value );

                if ( isNaN( parsedValue ) ) {
                    finalValue = '';
                } else {
                    finalValue = parsedValue;
                }
            }
                break;
            case ( /checkbox/.test( type ) || checked ):
                finalValue = getCheckboxValue(
                    getViaPath( currentStore.values, fieldName ) as CheckboxValue
                    , checked
                    , value
                );
                break;
            case options && multiple:
                finalValue = getMultiSelectValues( options );
                break;
            default: finalValue = value;
        }

        setFieldValue(
            fieldName as never
            , finalValue as DeepValue<TFormValues, DeepKeys<TFormValues>>
            , fieldValidationOptions
        );
    } );

    const handleBlur = useEventCallback( (
        e: OnBlurEvent
        , fieldValidationOptions?: FieldValidationOptions
    ) => {
        const fieldName = e.target.name as DeepKeys<TFormValues>;

        setFieldTouched( fieldName, true, fieldValidationOptions );
    } );

    return {
        registerField
        , unregisterField
        , handleChange
        , handleBlur
        , setFieldValue
        , setFieldTouched
        , validateField
    };
};
