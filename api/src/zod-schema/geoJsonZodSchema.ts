import { z } from 'zod';

/**
 * GeoJSON Zod Schemas derived from {@link https://geojson.org/schema/GeoJSON.json} and using
 * {@link https://www.npmjs.com/package/json-schema-to-zod} to generate the corresponding zod schema, below.
 */

export const GeoJSONPointZodSchema = z.object({
  type: z.enum(['Point']),
  coordinates: z.array(z.number()).min(2),
  bbox: z.array(z.number()).min(4).optional()
});

export const GeoJSONLineStringZodSchema = z.object({
  type: z.enum(['LineString']),
  coordinates: z.array(z.array(z.number()).min(2)).min(2),
  bbox: z.array(z.number()).min(4).optional()
});

export const GeoJSONPolygonZodSchema = z.object({
  type: z.enum(['Polygon']),
  coordinates: z.array(z.array(z.array(z.number()).min(2)).min(4)),
  bbox: z.array(z.number()).min(4).optional()
});

export const GeoJSONMultiPointZodSchema = z.object({
  type: z.enum(['MultiPoint']),
  coordinates: z.array(z.array(z.number()).min(2)),
  bbox: z.array(z.number()).min(4).optional()
});

export const GeoJSONMultiLineStringZodSchema = z.object({
  type: z.enum(['MultiLineString']),
  coordinates: z.array(z.array(z.array(z.number()).min(2)).min(2)),
  bbox: z.array(z.number()).min(4).optional()
});

export const GeoJSONMultiPolygonZodSchema = z.object({
  type: z.enum(['MultiPolygon']),
  coordinates: z.array(z.array(z.array(z.array(z.number()).min(2)).min(4))),
  bbox: z.array(z.number()).min(4).optional()
});

export const GeoJSONGeometryCollectionZodSchema = z.object({
  type: z.enum(['GeometryCollection']),
  geometries: z.array(
    z.any().superRefine((x, ctx) => {
      const schemas = [
        GeoJSONPointZodSchema,
        GeoJSONLineStringZodSchema,
        GeoJSONPolygonZodSchema,
        GeoJSONMultiPointZodSchema,
        GeoJSONMultiLineStringZodSchema,
        GeoJSONMultiPolygonZodSchema
      ];
      const errors = schemas.reduce(
        (errors: z.ZodError[], schema) =>
          ((result) => ('error' in result ? [...errors, result.error] : errors))(schema.safeParse(x)),
        []
      );
      if (schemas.length - errors.length !== 1) {
        ctx.addIssue({
          path: ctx.path,
          code: 'invalid_union',
          unionErrors: errors,
          message: 'Invalid input: Should pass single schema'
        });
      }
    })
  ),
  bbox: z.array(z.number()).min(4).optional()
});

export const GeoJSONFeatureZodSchema = z.object({
  type: z.enum(['Feature']),
  id: z
    .any()
    .superRefine((x, ctx) => {
      const schemas = [z.number(), z.string()];
      const errors = schemas.reduce(
        (errors: z.ZodError[], schema) =>
          ((result) => ('error' in result ? [...errors, result.error] : errors))(schema.safeParse(x)),
        []
      );
      if (schemas.length - errors.length !== 1) {
        ctx.addIssue({
          path: ctx.path,
          code: 'invalid_union',
          unionErrors: errors,
          message: 'Invalid input: Should pass single schema'
        });
      }
    })
    .optional(),
  properties: z.any().superRefine((x, ctx) => {
    const schemas = [z.record(z.any()), z.null()];
    const errors = schemas.reduce(
      (errors: z.ZodError[], schema) =>
        ((result) => ('error' in result ? [...errors, result.error] : errors))(schema.safeParse(x)),
      []
    );
    if (schemas.length - errors.length !== 1) {
      ctx.addIssue({
        path: ctx.path,
        code: 'invalid_union',
        unionErrors: errors,
        message: 'Invalid input: Should pass single schema'
      });
    }
  }),
  geometry: z.any().superRefine((x, ctx) => {
    const schemas = [
      GeoJSONPointZodSchema,
      GeoJSONLineStringZodSchema,
      GeoJSONPolygonZodSchema,
      GeoJSONMultiPointZodSchema,
      GeoJSONMultiLineStringZodSchema,
      GeoJSONMultiPolygonZodSchema,
      GeoJSONGeometryCollectionZodSchema,
      z.null()
    ];
    const errors = schemas.reduce(
      (errors: z.ZodError[], schema) =>
        ((result) => ('error' in result ? [...errors, result.error] : errors))(schema.safeParse(x)),
      []
    );
    if (schemas.length - errors.length !== 1) {
      ctx.addIssue({
        path: ctx.path,
        code: 'invalid_union',
        unionErrors: errors,
        message: 'Invalid input: Should pass single schema'
      });
    }
  }),
  bbox: z.array(z.number()).min(4).optional()
});

export const GeoJSONFeatureCollectionZodSchema = z.object({
  type: z.enum(['FeatureCollection']),
  features: z.array(
    z.object({
      type: z.enum(['Feature']),
      id: z
        .any()
        .superRefine((x, ctx) => {
          const schemas = [z.number(), z.string()];
          const errors = schemas.reduce(
            (errors: z.ZodError[], schema) =>
              ((result) => ('error' in result ? [...errors, result.error] : errors))(schema.safeParse(x)),
            []
          );
          if (schemas.length - errors.length !== 1) {
            ctx.addIssue({
              path: ctx.path,
              code: 'invalid_union',
              unionErrors: errors,
              message: 'Invalid input: Should pass single schema'
            });
          }
        })
        .optional(),
      properties: z.any().superRefine((x, ctx) => {
        const schemas = [z.record(z.any()), z.null()];
        const errors = schemas.reduce(
          (errors: z.ZodError[], schema) =>
            ((result) => ('error' in result ? [...errors, result.error] : errors))(schema.safeParse(x)),
          []
        );
        if (schemas.length - errors.length !== 1) {
          ctx.addIssue({
            path: ctx.path,
            code: 'invalid_union',
            unionErrors: errors,
            message: 'Invalid input: Should pass single schema'
          });
        }
      }),
      geometry: z.any().superRefine((x, ctx) => {
        const schemas = [
          GeoJSONPointZodSchema,
          GeoJSONLineStringZodSchema,
          GeoJSONPolygonZodSchema,
          GeoJSONMultiPointZodSchema,
          GeoJSONMultiLineStringZodSchema,
          GeoJSONMultiPolygonZodSchema,
          GeoJSONGeometryCollectionZodSchema,
          z.null()
        ];
        const errors = schemas.reduce(
          (errors: z.ZodError[], schema) =>
            ((result) => ('error' in result ? [...errors, result.error] : errors))(schema.safeParse(x)),
          []
        );
        if (schemas.length - errors.length !== 1) {
          ctx.addIssue({
            path: ctx.path,
            code: 'invalid_union',
            unionErrors: errors,
            message: 'Invalid input: Should pass single schema'
          });
        }
      }),
      bbox: z.array(z.number()).min(4).optional()
    })
  ),
  bbox: z.array(z.number()).min(4).optional()
});

export const GeoJSONZodSchema = z.any().superRefine((x, ctx) => {
  const schemas = [
    GeoJSONPointZodSchema,
    GeoJSONLineStringZodSchema,
    GeoJSONPolygonZodSchema,
    GeoJSONMultiPointZodSchema,
    GeoJSONMultiLineStringZodSchema,
    GeoJSONMultiPolygonZodSchema,
    GeoJSONGeometryCollectionZodSchema,
    GeoJSONFeatureCollectionZodSchema,
    GeoJSONFeatureZodSchema
  ];
  const errors = schemas.reduce(
    (errors: z.ZodError[], schema) =>
      ((result) => ('error' in result ? [...errors, result.error] : errors))(schema.safeParse(x)),
    []
  );
  if (schemas.length - errors.length !== 1) {
    ctx.addIssue({
      path: ctx.path,
      code: 'invalid_union',
      unionErrors: errors,
      message: 'Invalid input: Should pass single schema'
    });
  }
});
