import { z } from 'zod';

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
  geometries: z.array(z.object({})),
  bbox: z.array(z.number()).min(4).optional()
});

export const GeoJSONFeatureZodSchema = z.object({
  type: z.enum(['Feature']),
  id: z.union([z.number(), z.string()]).optional(),
  properties: z.object({}),
  geometry: z.object({}),
  bbox: z.array(z.number()).min(4).optional()
});

export const GeoJSONFeatureCollectionZodSchema = z.object({
  type: z.enum(['FeatureCollection']),
  features: z.array(z.object({})),
  bbox: z.array(z.number()).min(4).optional()
});
