import {
    ChangeEvent
    , FocusEvent
    , JSX
} from 'react';

export type Prettify<T> = {
    [K in keyof T]: T[K];
} & {};

export type ValueOf<T> = T[keyof T];
export type Entries<T> = [keyof T, ValueOf<T>][];

export type NoInfer<T> = [T][T extends unknown ? 0 : never];

export type Primitive = string | number | boolean | Nullish;
export type EmptyObject = Record<string, never>;
export type UnsubScribeFn = () => void;
export type Subscriber = () => void;

export type Nullish = null | undefined;
export type Falsey = Nullish | false | 0 | '';
export type CheckArray<T, Output = undefined> =
    T extends unknown[]
        ? Output extends {}
            ? Output
            : T
        : never;

export type IntrinsicFormElements = Pick<JSX.IntrinsicElements,
    'input'
    | 'label'
    | 'select'
    | 'textarea'
    | 'button'
    | 'fieldset'
    | 'legend'
    | 'datalist'
    | 'output'
    | 'option'
    | 'optgroup'
>;

export type OnChangeEvent = ChangeEvent<HTMLInputElement | HTMLSelectElement>;
export type OnBlurEvent = FocusEvent<HTMLInputElement | HTMLSelectElement>;
export type FieldEventNames = 'onChange' | 'onBlur';

export type CheckboxValue = string | boolean | unknown[];

export type DeepKeys<TObj, IsRoot = true, Depth extends number[] = []> =
    Depth['length'] extends MAX_RECURSION_LEVELS
        ? never
        : keyof TObj extends infer TKey
            ? TKey extends keyof TObj
                ? TKey extends string | number | undefined
                    ? TObj[TKey] extends Array<infer U>
                        ? `${ Keys<TObj, IsRoot, TKey & keyof TObj> }` |
                            `${ Keys<TObj, IsRoot, TKey & keyof TObj> }[${ number }]` |
                            ( U extends object
                                    ? `${ Keys<TObj, IsRoot, TKey & keyof TObj> }[${ number }]${ Exclude<DeepKeys<U, false, [...Depth, 1]>, ''> }`
                                    : never )
                        : TObj[TKey] extends object
                            ? `${ Keys<TObj, IsRoot, TKey & keyof TObj> }${ Exclude<DeepKeys<TObj[TKey], false, [...Depth, 1]>, ''> }`
                            : `${ Keys<TObj, IsRoot, TKey & keyof TObj> }`
                    : never
                : never
            : never;

export type DeepValue<T, P> = P extends `${ infer Left }.${ infer Right }`
    ? Left extends keyof Exclude<T, undefined>
        ? FieldValueOrUndefined<Exclude<T, undefined>[Left], Right> | Extract<T, undefined>
        : Left extends `${ infer FieldKey }[${ infer IndexKey }]`
            ? FieldKey extends keyof T
                ? FieldValueOrUndefined<IndexedFieldValueOrUndefined<T[FieldKey], IndexKey>, Right>
                : undefined
            : undefined
    : P extends keyof T
        ? T[P]
        : P extends `${ infer FieldKey }[${ infer IndexKey }]`
            ? FieldKey extends keyof T
                ? IndexedFieldValueOrUndefined<T[FieldKey], IndexKey>
                : undefined
            : IndexedFieldValueOrUndefined<T, P>;

export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends Array<infer U>
        ? Array<DeepPartial<U>>
        : T[P] extends ReadonlyArray<infer U>
            ? ReadonlyArray<DeepPartial<U>>
            : DeepPartial<T[P]>
    };

////// HELPERS //////
type MAX_RECURSION_LEVELS = 10;

type RemoveArrayMethods<T> = T extends number
    ? number
    : T extends keyof unknown[]
        ? never
        : T;

type IsNumberKey<TKey> = TKey extends number ? TKey : never;

type Keys<TObj, IsRoot, TKey extends string | number> =
    IsRoot extends true
        ? TKey | ( TObj extends unknown[] ? `[${ IsNumberKey<TKey> }]` : never )
        : `.${ RemoveArrayMethods<TKey> }` | ( TObj extends unknown[] ? `[${ IsNumberKey<TKey> }]` | `.[${ IsNumberKey<TKey> }]` : never );

type GetIndexedFieldValue<T, K> = K extends keyof T
    ? T[K]
    : K extends `${ number }`
        ? 'length' extends keyof T
            ? number extends T['length']
                ? number extends keyof T
                    ? T[number]
                    : undefined
                : undefined
            : undefined
        : undefined;

type FieldValueOrUndefined<T, Key> =
    | DeepValue<Exclude<T, undefined>, Key>
    | Extract<T, undefined>;

type IndexedFieldValueOrUndefined<T, Key> =
    | GetIndexedFieldValue<Exclude<T, undefined>, Key>
    | Extract<T, undefined>;

export type MapNestedPrimitivesTo<TObj, Output = string> = {
    [K in keyof TObj]?: TObj[K] extends Array<infer U>
        ? Array<
            U extends object
                ? MapNestedPrimitivesTo<U>
                : U extends Primitive
                    ? Output
                    : never
            >
        : TObj[K] extends object
            ? MapNestedPrimitivesTo<TObj[K]>
            : Output;
};

export type OmitFirstArg<F> = F extends ( arg: unknown, ...rest: infer R ) => infer ReturnType
    ? ( ...args: R ) => ReturnType
    : never;
