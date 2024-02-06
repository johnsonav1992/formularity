export type Prettify<T> = {
    [K in keyof T]: T[K];
} & {};

type Keys<O, IsTop, K extends string | number> =
    IsTop extends true
        ? K | ( O extends unknown[] ? `[${ K }]` : never )
        : `.${ K }` | ( O extends unknown[] ? `[${ K }]` | `.[${ K }]` : never );

export type DeepKeys<T, IsTop = true, K extends keyof T = keyof T> =
    K extends string | number
        ? `${ Keys<T, IsTop, K> }${ '' | ( T[K] extends object ? DeepKeys<T[K], false> : '' ) }`
        : never;

export type DeepValue<TObj, TKey> = TObj extends Record<PropertyKey, unknown>
    ? TKey extends `${ infer TBranch }.${ infer TDeepKey }`
        ? DeepValue<TObj[TBranch], TDeepKey>
        : TObj[TKey & keyof TObj]
    : never;
