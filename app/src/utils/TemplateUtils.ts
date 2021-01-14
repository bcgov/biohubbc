import jsonpatch from 'fast-json-patch';
import traverse from 'json-schema-traverse';

/**
 * Custom template keys used by these util functions to populate the enum of a template dynamically.
 *
 * Example:
 *
 *  a_template_field: {
 *   type: 'number',
 *   title: 'A Template Field Title',
 *   'x-enum-code': {
 *     'table': 'name_of_the_database_table',
 *     'id_column': 'name_of_the_column_holding_the_unique_id',
 *     'text_column': 'name_of_the_column_holding_the_human_readable_name'
 *   }
 * }
 *
 * @export
 * @enum {number}
 */
export enum X_ENUM_CODE {
  OBJ = 'x-enum-code',
  CODE_TABLE = 'table',
  CODE_ID_COLUMN = 'id_column',
  CODE_TEXT_COLUMN = 'text_column'
}

/**
 * Apply codes to a JSON-Scehma template, as enums.
 *
 * @export
 * @param {(object | null)} codes object containing the codes to populate the template with
 * @param {(object | null)} template the template to populate enums using any matching codes
 * @return {*}
 */
export const populateTemplateWithCodes = (codes: object | null, template: object | null) => {
  if (!codes || !template) {
    return template;
  }

  traverse(template, {
    allKeys: true,
    cb: (schema, jsonPtr) => {
      // apply code enum filters if a `x-enum-code` field exists
      if (Object.keys(schema).includes(X_ENUM_CODE.OBJ)) {
        // apply code enum filtering to this piece of schema
        const updatedSchema = applyCodeEnumFilter(schema, codes);

        // update template, replacing the old schema part with the updated schema part
        jsonpatch.applyPatch(template, [{ op: 'replace', path: jsonPtr, value: updatedSchema }]);
      }
    }
  });

  return template;
};

/**
 * Updates an object to include code enum json spec.
 *
 * @export
 * @param {object} schema the schema object to apply updates to
 * @param {object} codes an object containing the codes
 * @return {*}  {object}
 */
export const applyCodeEnumFilter = (schema: object, codes: object): object => {
  // prase the `x-enum-code` object
  const xEnumCodeObj = schema[X_ENUM_CODE.OBJ];

  const codeTable = xEnumCodeObj[X_ENUM_CODE.CODE_TABLE];
  const codeIDColumn = xEnumCodeObj[X_ENUM_CODE.CODE_ID_COLUMN];
  const codeTextColumn = xEnumCodeObj[X_ENUM_CODE.CODE_TEXT_COLUMN];

  if (!codeTable || !codeIDColumn || !codeTextColumn) {
    return schema;
  }

  // Get the code set for the indicated code table
  const codeSet: object[] = codes[codeTable];

  if (!codeSet?.length) {
    return schema;
  }

  // update the object, adding an `anyOf` field whose value is an array of enum objects
  schema = {
    ...schema,
    anyOf: codeSet.map((codeValue) => {
      return {
        // the `type` specified by the parent object that contains this enum object (their types must match)
        type: schema['type'],
        // the column that contains the unique value for this code
        enum: [codeValue[codeIDColumn]],
        // the column that contains the human readable name of this code
        title: codeValue[codeTextColumn]
      };
    })
  };

  return schema;
};
