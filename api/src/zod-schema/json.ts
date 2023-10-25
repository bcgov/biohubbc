import * as z from 'zod';

// Defines a Zod Schema for a valid JSON value
// Not safe of massive JSON object. Causes a Heap out of memory error
const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
type Literal = z.infer<typeof literalSchema>;
type Json = Literal | { [key: string]: Json } | Json[];
export const jsonSchema: z.ZodType<Json> = z.lazy(() =>
  z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)])
);

// Defines a Zod Schema for a shallow JSON value
export const shallowJsonSchema: z.ZodType<Json> = z.lazy(() =>
  z.union([literalSchema, z.array(z.any()), z.record(z.string()), z.record(z.any())])
);
