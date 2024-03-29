export type Prettify<T> = {
    [K in keyof T]: T[K];
} & {};

export type NoInfer<T> = [T][T extends unknown ? 0 : never];

export type EmptyObject = Record<string, never>;
export type UnsubScribeFn = () => void;
export type Subscriber = () => void;

export type Nullish = null | undefined;

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

export type DeepKeys<TObj, IsRoot = true, TKey extends keyof TObj = keyof TObj> =
    TKey extends string | number
        ? `${ Keys<TObj, IsRoot, TKey> }${ '' | ( TObj[TKey] extends object ? DeepKeys<TObj[TKey], false> : '' ) }`
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

////// HELPERS //////
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
