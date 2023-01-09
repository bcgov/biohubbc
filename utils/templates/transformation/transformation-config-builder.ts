import Ajv from 'ajv';
import * as fs from 'fs';
import { transformationConfigJSONSchema } from '../../../api/src/utils/media/xlsx/transformation/xlsx-transform-schema';
import { TransformSchema } from '../../../api/src/utils/media/xlsx/transformation/xlsx-transform-schema-parser';

// Build your transform config here, using any helper typescript functions or variables to reduce the manual effort
// needed to make the config.
const TRANSFORMATION_SCHEMA: TransformSchema = { dwcMeta: [], map: [], templateMeta: [] };

// Validates the config against the json-schema definition to catch errors early
const ajv = new Ajv();
ajv.validate(transformationConfigJSONSchema, TRANSFORMATION_SCHEMA);
if (ajv.errors) {
  throw new Error(JSON.stringify(ajv.errors));
}

// Write the raw transform JSON config.
fs.writeFile('./transformation_config.json', TRANSFORMATION_SCHEMA, (error) => {
  throw new Error(JSON.stringify(error));
});
