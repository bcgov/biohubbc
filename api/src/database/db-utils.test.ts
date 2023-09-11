import { QueryResult } from 'pg';
import { z } from 'zod';
import { getZodQueryResult } from './db-utils';

/**
 * Enforces that a zod schema satisfies an existing type definition.
 *
 * Code copied from: https://github.com/colinhacks/zod/issues/372#issuecomment-1280054492
 * An unresolved feature request was opened as well: https://github.com/colinhacks/zod/issues/2084
 *
 * Note: This may not be sufficient to cover ALL possible scenarios.
 *
 * @example
 * const myZodSchema = z.object({...});
 * // Compile error if `myZodSchema` doesn't satisfy `TypeDefinitionToCompareTo`
 * zodImplements<TypeDefinitionToCompareTo>().with(myZodSchema.shape);
 *
 * @template Model
 * @return {*}
 */
function zodImplements<Model = never>() {
  type ZodImplements<Model> = {
    [key in keyof Model]-?: undefined extends Model[key]
      ? null extends Model[key]
        ? z.ZodNullableType<z.ZodOptionalType<z.ZodType<Model[key]>>>
        : z.ZodOptionalType<z.ZodType<Model[key]>>
      : null extends Model[key]
      ? z.ZodNullableType<z.ZodType<Model[key]>>
      : z.ZodType<Model[key]>;
  };

  return {
    with: <
      Schema extends ZodImplements<Model> &
        {
          [unknownKey in Exclude<keyof Schema, keyof Model>]: never;
        }
    >(
      schema: Schema
    ) => z.object(schema)
  };
}

describe('getZodQueryResult', () => {
  it('defines a zod schema that conforms to the real pg `QueryResult` type', () => {
    const zodQueryResultRow = z.object({});

    const zodQueryResult = getZodQueryResult(zodQueryResultRow);

    // Not a traditional test: will just cause a compile error if the zod schema doesn't satisfy the `QueryResult` type
    zodImplements<QueryResult>().with(zodQueryResult.shape);
  });
});
