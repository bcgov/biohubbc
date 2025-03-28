/**
 * Prettify a complex type's hover documentation.
 *
 * Note: Does not change the underlying type. Only provides more readable hover documentation.
 *
 * @example
 *    Before: PersonAddress = Person & Address;
 *    After: PersonAddress = { name: string; street: string; }
 *
 * @see https://timdeschryver.dev/bits/pretty-typescript-types
 */

type Prettify<T> = { [K in keyof T]: T[K] } & {};
