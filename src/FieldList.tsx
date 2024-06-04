import { ReactNode } from 'react';

// Types
import {
    DeepKeys
    , DeepValue
    , CheckArray
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
    , TListData = CheckArray<DeepValue<TFormValues, TFieldName>>
> = {
    name: TFieldName;
    render: (
        listValue: TListData
        , fieldListHelpers: CheckArray<
            TListData
            , FieldListHelpers<CheckArray<TListData>>
        >
    ) => ReactNode;
};

export const FieldList = <
    TFormValues extends FormValues = FormValues
    , TFieldName extends DeepKeys<TFormValues> = DeepKeys<TFormValues>
    , TListData = CheckArray<DeepValue<TFormValues, TFieldName>>
    >( {
        name
        , render
    }: FieldListProps ) => {

    const {
        values
        , setFieldValue
    } = useFormularityContext<TFormValues>();

    const listData = getViaPath( values, name ) as TListData;

    if ( !Array.isArray( listData ) ) {
        throw new Error(
            `Value "${ name }" is not an array. 
            The <FieldList /> component can only be used with 
            values that are arrays.`
        );
    }

    const helpers: FieldListHelpers<CheckArray<TListData>> = {
        addField: newFieldData => {
            setFieldValue( name, [ ...listData, newFieldData ] as never );
        }
        , removeField: fieldIndex => {
            setFieldValue(
                name
                , [
                    ...listData.slice( 0, fieldIndex )
                    , ...listData.slice( fieldIndex + 1 )
                ] as never
            );
        }
        , moveField: ( currentFieldIndex, newFieldIndex ) => {
            const newList = [ ...listData ];
            const fieldToMove = newList[ currentFieldIndex ];

            newList.splice( currentFieldIndex, 1 );
            newList.splice( newFieldIndex, 0, fieldToMove );

            setFieldValue( name, newList as never );
        }
        , replaceField: ( fieldIndexToReplace, fieldData ) => {
            const newList = [ ...listData ];
            newList[ fieldIndexToReplace ] = fieldData;

            setFieldValue( name, newList as never );
        }
        , insertField: ( fieldIndexToInsert, fieldData ) => {
            const newList = [ ...listData ];
            newList.splice( fieldIndexToInsert, 0, fieldData );

            setFieldValue( name, newList as never );
        }
        , swapFields: ( fieldIndexA, fieldIndexB ) => {
            const newList = [ ...listData ];
            const fieldA = newList[ fieldIndexA ];
            const fieldB = newList[ fieldIndexB ];

            newList[ fieldIndexA ] = fieldB;
            newList[ fieldIndexB ] = fieldA;

            setFieldValue( name, newList as never );
        }
        , removeLastField: () => {
            setFieldValue(
                name
                , [ ...listData.slice( 0, -1 ) ] as never
            );
        }
        , addFieldToBeginning: fieldData => {
            setFieldValue( name, [ fieldData, ...listData ] as never );
        }
    };

    return render(
        listData as never
        , helpers as never
    );
};
