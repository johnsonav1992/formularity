import { ReactNode } from 'react';
import {
    DeepKeys
    , DeepValue
} from './utilityTypes';
import { FormValues } from './types';
import { useFormularityContext } from './FormularityContext';
import { getViaPath } from './utils';

type FieldListHelpers<TFieldData> = {
    /**
     * Adds a new field to the end of the list
     */
    addField: ( fieldData: TFieldData ) => void;
    /**
     * Removes the field at the specified index
     */
    removeField: ( fieldIndex: number ) => void;
    /**
     * Moves the contents of one field in the list to another index
     */
    moveField: ( currentFieldIndex: number, newFieldIndex: number ) => void;
    /**
     * Replace the value of a field at the specified index with a new value
     */
    replaceField: ( fieldIndexToReplace: number, fieldData: TFieldData ) => void;
    /**
     * Inserts a new field at the specified index
     */
    insertField: ( fieldIndexToInsert: number, fieldData: TFieldData ) => void;
    /**
     * Swaps the values of two fields in the list
     */
    swapFields: ( fieldIndexA: number, fieldIndexB: number ) => void;
    /**
     * Removes the last field in the list
     */
    removeLastField: () => void;
    /**
     * Adds a new field to the beginning of the list
     */
    addFieldToBeginning: ( fieldData: TFieldData ) => void;
};

type FieldListProps<
    TFormValues extends FormValues = FormValues
    , TFieldName extends DeepKeys<TFormValues> = DeepKeys<TFormValues>
    , TFieldData extends DeepValue<TFormValues, TFieldName> = DeepValue<TFormValues, TFieldName>
> = {
    name: TFieldName;
    render: ( listValue: unknown[], fieldListHelpers: FieldListHelpers<TFieldData> ) => ReactNode;
};

const FieldList = <
    TFormValues extends FormValues = FormValues
    , TFieldName extends DeepKeys<TFormValues> = DeepKeys<TFormValues>
    , TFieldData extends DeepValue<TFormValues, TFieldName> = DeepValue<TFormValues, TFieldName>
>( {
        name
        , render
    }: FieldListProps ) => {
    const formularity = useFormularityContext();

    const list = getViaPath( formularity.values, name ) as DeepValue<TFormValues, TFieldName>;

    if ( !Array.isArray( list ) ) {
        throw new Error(
            `Value "${ name }" is not an array. 
            The <FieldList /> component can only be used with 
            values that are arrays.`
        );
    }

    const addField: FieldListHelpers<TFieldData>['addField'] = fieldData => {
        formularity.setFieldValue( name, [ ...list, fieldData ] as never );
    };

    const removeField: FieldListHelpers<TFieldData>['removeField'] = fieldIndex => {
        formularity.setFieldValue(
            name
            , [
                ...list.slice( 0, fieldIndex )
                , ...list.slice( fieldIndex + 1 )
            ] as never
        );
    };

    const moveField: FieldListHelpers<TFieldData>['moveField'] = ( currentFieldIndex, newFieldIndex ) => {
        const newList = [ ...list ];
        const fieldToMove = newList[ currentFieldIndex ];

        newList.splice( currentFieldIndex, 1 );
        newList.splice( newFieldIndex, 0, fieldToMove );

        formularity.setFieldValue( name, newList as never );
    };

    const replaceField: FieldListHelpers<TFieldData>['replaceField'] = ( fieldIndexToReplace, fieldData ) => {
        const newList = [ ...list ];
        newList[ fieldIndexToReplace ] = fieldData;

        formularity.setFieldValue( name, newList as never );
    };

    const insertField: FieldListHelpers<TFieldData>['insertField'] = ( fieldIndexToInsert, fieldData ) => {
        const newList = [ ...list ];
        newList.splice( fieldIndexToInsert, 0, fieldData );

        formularity.setFieldValue( name, newList as never );
    };

    const swapFields: FieldListHelpers<TFieldData>['swapFields'] = ( fieldIndexA, fieldIndexB ) => {
        const newList = [ ...list ];
        const fieldA = newList[ fieldIndexA ];
        const fieldB = newList[ fieldIndexB ];

        newList[ fieldIndexA ] = fieldB;
        newList[ fieldIndexB ] = fieldA;

        formularity.setFieldValue( name, newList as never );
    };

    const removeLastField: FieldListHelpers<TFieldData>['removeLastField'] = () => {
        formularity.setFieldValue(
            name
            , [ ...list.slice( 0, -1 ) ] as never
        );
    };

    const addFieldToBeginning: FieldListHelpers<TFieldData>['addFieldToBeginning'] = fieldData => {
        formularity.setFieldValue( name, [ fieldData, ...list ] as never );
    };

    return render(
        list
        , {
            addField
            , removeField
            , moveField
            , replaceField
            , insertField
            , swapFields
            , removeLastField
            , addFieldToBeginning
        }
    );
};

export default FieldList;
