export type Prettify<T> = {
    [K in keyof T]: T[K];
} & {};

type Keys<TObj, IsRoot, TKey extends string | number> =
    IsRoot extends true
        ? TKey | ( TObj extends unknown[] ? `[${ TKey }]` : never )
        : `.${ TKey }` | ( TObj extends unknown[] ? `[${ TKey }]` | `.[${ TKey }]` : never );

export type DeepKeys<TObj, IsRoot = true, TKey extends keyof TObj = keyof TObj> =
    TKey extends string | number
        ? `${ Keys<TObj, IsRoot, TKey> }${ '' | ( TObj[TKey] extends object ? DeepKeys<TObj[TKey], false> : '' ) }`
        : never;

export type DeepValue<TObj, TKey> = TObj extends Record<PropertyKey, unknown>
    ? TKey extends `${ infer TBranch }.${ infer TDeepKey }`
        ? DeepValue<TObj[TBranch], TDeepKey>
        : TObj[TKey & keyof TObj]
    : never;
