import { ReactNode } from 'react';

// Types
import {
    DeepKeys
    , DeepValue
    , IsArray
} from './utilityTypes';
import { FormValues } from './types';

// Context
import { useFormularityContext } from './FormularityContext';

// Utils
import { getViaPath } from './utils';

type FieldListHelpers<TListData extends unknown[]> = {
    /**
     * Adds a new field to the end of the list
     */
    addField: ( fieldData: TListData[number] ) => void;
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
    replaceField: ( fieldIndexToReplace: number, fieldData: TListData[number] ) => void;
    /**
     * Inserts a new field at the specified index
     */
    insertField: ( fieldIndexToInsert: number, fieldData: TListData[number] ) => void;
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
    addFieldToBeginning: ( fieldData: TListData[number] ) => void;
};

export type FieldListProps<
    TFormValues extends FormValues = FormValues
    , TFieldName extends DeepKeys<TFormValues> = DeepKeys<TFormValues>
    , TListData extends DeepValue<TFormValues, TFieldName> = DeepValue<TFormValues, TFieldName>
> = {
    name: TFieldName;
    render: (
        listValue: TListData
        , fieldListHelpers: FieldListHelpers<IsArray<TListData>>
    ) => ReactNode;
};

export const FieldList = <
    TFormValues extends FormValues = FormValues
    , TFieldName extends DeepKeys<TFormValues> = DeepKeys<TFormValues>
    , TListData extends DeepValue<TFormValues, TFieldName> = DeepValue<TFormValues, TFieldName>
    , TListItemArray extends unknown[] = IsArray<TListData>
    >( {
        name
        , render
    }: FieldListProps ) => {

    const {
        values
        , setFieldValue
    } = useFormularityContext();

    const list = getViaPath( values, name ) as TListData;

    if ( !Array.isArray( list ) ) {
        throw new Error(
            `Value "${ name }" is not an array. 
            The <FieldList /> component can only be used with 
            values that are arrays.`
        );
    }

    const helpers: FieldListHelpers<TListItemArray> = {
        addField: fieldData => {
            setFieldValue( name, [ ...list, fieldData ] as never );
        }
        , removeField: fieldIndex => {
            setFieldValue(
                name
                , [
                    ...list.slice( 0, fieldIndex )
                    , ...list.slice( fieldIndex + 1 )
                ] as never
            );
        }
        , moveField: ( currentFieldIndex, newFieldIndex ) => {
            const newList = [ ...list ];
            const fieldToMove = newList[ currentFieldIndex ];

            newList.splice( currentFieldIndex, 1 );
            newList.splice( newFieldIndex, 0, fieldToMove );

            setFieldValue( name, newList as never );
        }
        , replaceField: ( fieldIndexToReplace, fieldData ) => {
            const newList = [ ...list ];
            newList[ fieldIndexToReplace ] = fieldData;

            setFieldValue( name, newList as never );
        }
        , insertField: ( fieldIndexToInsert, fieldData ) => {
            const newList = [ ...list ];
            newList.splice( fieldIndexToInsert, 0, fieldData );

            setFieldValue( name, newList as never );
        }
        , swapFields: ( fieldIndexA, fieldIndexB ) => {
            const newList = [ ...list ];
            const fieldA = newList[ fieldIndexA ];
            const fieldB = newList[ fieldIndexB ];

            newList[ fieldIndexA ] = fieldB;
            newList[ fieldIndexB ] = fieldA;

            setFieldValue( name, newList as never );
        }
        , removeLastField: () => {
            setFieldValue(
                name
                , [ ...list.slice( 0, -1 ) ] as never
            );
        }
        , addFieldToBeginning: fieldData => {
            setFieldValue( name, [ fieldData, ...list ] as never );
        }
    };

    return render(
        list as never
        , helpers
    );
};
