import {
    useEffect
    , useState
} from 'react';
import {
    FormValues
    , FormularityConstructorFunctionArgs
} from './types/types';
import { Formularity } from './formularity';

type UseFormParams<TFormValues extends FormValues> = FormularityConstructorFunctionArgs<TFormValues>;

export const useForm = <TFormValues extends FormValues>( formOptions: UseFormParams<TFormValues> ) => {
    const [ form, setForm ] = useState<Formularity<TFormValues>>( () => new Formularity( formOptions ) );

    useEffect( () => {
        //@ts-expect-error -> this is needed for rerendering
        form.setUpdater( () => setForm( prevForm => ( { ...prevForm } ) ) );
    }, [ form ] );

    return form;
};
