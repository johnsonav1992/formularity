import {
    useMemo
    , useState
} from 'react';
import {
    FormValues
    , FormularityConstructorFunctionArgs
} from './types/types';
import { Formularity } from './formularity';

type UseFormParams<TFormValues extends FormValues> = Omit<FormularityConstructorFunctionArgs<TFormValues>, 'updater'>;

// Your hook code
// Your hook code
export const useForm = <TFormValues extends FormValues>(
    formOptions: UseFormParams<TFormValues>
): Formularity<TFormValues> => {
    const [ form, setForm ] = useState<Formularity<TFormValues> | null>( null );

    const initializedForm = useMemo( () => {
        if ( !form ) {
            const newForm = new Formularity( {
                initialFormValues: formOptions.initialFormValues
                , onSubmit: formOptions.onSubmit
                , updater: () => setForm( prevForm => ( { ...prevForm } as never ) )
            } );
            setForm( newForm );
            return newForm;
        }
        return form;
    }, [ form, formOptions ] );

    return initializedForm;
};
