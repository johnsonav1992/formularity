import {
    useEffect
    , useMemo
    , useState
} from 'react';
import {
    FormValues
    , FormularityConstructorFunctionArgs
} from './types/types';
import { Formularity } from './formularityOld';

type UseFormParams<TFormValues extends FormValues> = Omit<FormularityConstructorFunctionArgs<TFormValues>, 'updater'>;

/**
 *
 * @description Hook for creating and working with a form
 * @param formOptions - options for configuring the form
 *
 * @returns {Formularity} a new Formularity form
 *
 */
export const useForm = <TFormValues extends FormValues>(
    formOptions: UseFormParams<TFormValues>
): Formularity<TFormValues> => {
    const [ form, setForm ] = useState<Formularity<TFormValues> | null>( () => new Formularity( formOptions ) );

    useEffect( () => {
        form?.setUpdaterCallback( () => setForm( prevForm => prevForm ) );
    }, [ form ] );

    return form!;
};
