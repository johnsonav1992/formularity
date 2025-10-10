import { useMemo } from 'react';
import { useStoreSelector } from './useStoreSelector';
import { getViaPath } from './generalUtils';
import type { FormStore, FormErrors, FormTouched, FormValues, FormStoreState } from './types';
import type { DeepKeys, DeepValue } from './utilityTypes';

/**
 * A convenience hook that subscribes to a specific field's state from the store.
 * Returns the field's value, error, and touched state.
 * Only re-renders when this specific field's data changes.
 *
 * @param formStore - The form store
 * @param fieldName - The name/path of the field
 * @returns Object containing value, error, and touched for the field
 */
export function useFieldState<
    TFormValues extends FormValues,
    TFieldName extends DeepKeys<TFormValues>
>(
    formStore: FormStore<TFormValues>,
    fieldName: TFieldName
) {
    const selector = useMemo(
        () => (state: FormStoreState<TFormValues>) => ({
            value: getViaPath(state.values, fieldName) as DeepValue<TFormValues, TFieldName>,
            error: getViaPath(state.errors, fieldName as DeepKeys<FormErrors<FormValues>>),
            touched: getViaPath(state.touched, fieldName as DeepKeys<FormTouched<FormValues>>)
        }),
        [fieldName]
    );

    return useStoreSelector(formStore, selector);
}
