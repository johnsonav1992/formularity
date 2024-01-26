import { Formularity } from '../formularity';

export type FormValues = Record<PropertyKey, unknown>;
export type FormErrors<TFormValues extends FormValues> = Record<keyof TFormValues, string>;

export type SubmitHandler<TFormValues extends FormValues> =
    ( values: TFormValues, formularity: Formularity<TFormValues> ) => void | Promise<void>;

export type FormularityConstructorFunctionArgs<TFormValues extends FormValues> = {
    initialFormValues: TFormValues;
    onSubmit: SubmitHandler<TFormValues>;
    updater: () => void;
};
