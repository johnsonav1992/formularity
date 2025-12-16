import { useCallback } from 'react';

// Types
import {
    FormStore
    , FormValues
    , FieldRegistry
} from './types';
import {  DeepKeys } from './utilityTypes';

// Hooks
import { useFormularityContext } from './FormularityContext';
import { useFieldHandlers } from './useFieldHandlers';

/**
 * Hook that provides stable form handlers from context.
 * These handlers don't cause rerenders when called.
 */
export const useFormHandlers = <TFormValues extends FormValues>() => {
    const {
        formStore
        , fieldRegistry
        , validateOnChange
        , validateOnBlur
    } = useFormularityContext<TFormValues>();

    const currentStore = formStore.get();

    const handlers = useFieldHandlers(
        formStore
        , fieldRegistry
        , validateOnChange
        , validateOnBlur
        , currentStore.validationSchema
        , currentStore.manualValidationHandler
    );

    return handlers;
};
