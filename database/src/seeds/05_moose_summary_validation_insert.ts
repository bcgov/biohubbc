import { Knex } from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;
const DB_SCHEMA_DAPI_V1 = process.env.DB_SCHEMA_DAPI_V1;

/**
 * Add spatial transform
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function seed(knex: Knex): Promise<void> {
  await knex.raw(`
    SET SCHEMA '${DB_SCHEMA}';
    SET SEARCH_PATH = ${DB_SCHEMA}, ${DB_SCHEMA_DAPI_V1};
  `);

  const response = await knex.raw(`
    ${checkTemplateExists()}
  `);

  if (!response?.rows?.[0]) {
    await knex.raw(`
      ${insertSummaryTemplate()}
    `);
  }
}

const validationName = 'Moose_Summary_Results_1.0';
const validationVersion = '1.0';
const mooseWldtaxonomicUnitsId = 2065;

const checkTemplateExists = () => `
  SELECT
    summary_template_id
  FROM
    summary_template
  WHERE
    name = 'Moose_Summary_Results_1.0';
`;

/**
 * SQL to insert Summary Template
 *
 */
const insertSummaryTemplate = () => `
  WITH new_template_record AS (
    INSERT into summary_template
      (name, version, record_effective_date, description)
    VALUES
      ('${validationName}', '${validationVersion}', now(), '${validationName}')
    RETURNING summary_template_id
  )
  INSERT into summary_template_species
  (summary_template_id, wldtaxonomic_units_id, validation)
  VALUES (
    (SELECT summary_template_id FROM new_template_record),
    ${mooseWldtaxonomicUnitsId} ,
    '${summaryValidation}'
  );
`;

const summaryValidation =
  '{"name":"","description":"","defaultFile":{"description":"","columns":[{"name":"Observed","description":"","validations":[{"column_numeric_validator":{"name":"","description":""}}]},{"name":"Estimated","description":"","validations":[{"column_numeric_validator":{"name":"","description":""}}]},{"name":"Sightability Correction Factor","description":"","validations":[{"column_numeric_validator":{"name":"","description":""}}]},{"name":"SE","description":"","validations":[{"column_numeric_validator":{"name":"","description":""}}]},{"name":"Coefficient of Variation (%)","description":"","validations":[{"column_numeric_validator":{"name":"","description":""}}]},{"name":"Confidence Level (%)","description":"","validations":[{"column_numeric_validator":{"name":"","description":""}}]},{"name":"Area Flown (km2)","description":"","validations":[{"column_numeric_validator":{"name":"","description":""}}]},{"name":"Total Survey Area (km2)","description":"","validations":[{"column_numeric_validator":{"name":"","description":""}}]},{"name":"Total Kilometers Surveyed (km)","description":"","validations":[{"column_numeric_validator":{"name":"","description":""}}]},{"name":"Best Parameter Value Flag","description":"","validations":[{"column_code_validator":{"name":"","description":"","allowed_code_values":[{"name":"Yes","description":""},{"name":"No","description":""},{"name":"Unknown","description":""},{"name":"Not Evaluated","description":""}]}}]},{"name":"Total Marked Animals Observed","description":"","validations":[{"column_numeric_validator":{"name":"","description":""}}]},{"name":"Marked Animals Available","description":"","validations":[{"column_numeric_validator":{"name":"","description":""}}]}],"validations":[{"file_duplicate_columns_validator":{}},{"file_required_columns_validator":{"required_columns":["Study Area","Population Unit","Block/Sample Unit","Parameter","Stratum","Observed","Estimated","Sightability Model","Sightability Correction Factor","SE","Coefficient of Variation (%)","Confidence Level (%)","Lower CL","Upper CL","Total Survey Area (km2)","Area Flown (km2)","Total Kilometers Surveyed (km)","Best Parameter Value Flag","Outlier Blocks Removed","Total Marked Animals Observed","Marked Animals Available","Parameter Comments"]}}]},"validations":[{"mimetype_validator":{"reg_exps":["text\\/csv","application\\/vnd.*"]}}]}';
