import { ReactNode } from 'react';

type FieldListHelpers = {
    addField: ( fieldData: unknown ) => {};
    removeField: ( fieldIndex: number ) => {};
    moveField: ( currentFieldIndex: number, newFieldIndex: number ) => {};
    replaceField: ( fieldIndexToReplace: number, fieldData: unknown ) => {};
    insertField: ( fieldIndexToInsert: number, fieldData: unknown ) => {};
    swapFields: ( fieldIndexA: number, fieldIndexB: number ) => {};
    removeLastField: () => {};
    addFieldToBeginning: ( fieldData: unknown ) => {};
};

type FieldListProps = {
    render: ( fieldListHelpers: FieldListHelpers ) => ReactNode;
};

const FieldList = ( { render }: FieldListProps ) => {
    const helpers = {} as FieldListHelpers;

    return render( helpers );
};

export default FieldList;
