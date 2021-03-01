import { SQL, SQLStatement } from 'sql-template-strings';
import { PostProjectObject, PostSpeciesObject, PostProjectRegionObject } from '../models/project';
import { getLogger } from '../utils/logger';
import { Feature } from 'geojson';

const defaultLog = getLogger('queries/project-queries');

/**
 * SQL query to insert a project row.
 *
 * @param {PostProjectObject} project
 * @returns {SQLStatement} sql query object
 */
export const postProjectSQL = (project: PostProjectObject): SQLStatement | null => {
  defaultLog.debug({ label: 'postProjectSQL', message: 'params', PostProjectObject });

  if (!project) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    INSERT INTO project (
      name,
      objectives,
      scientific_collection_permit_number,
      management_recovery_action,
      location_description,
      start_date,
      end_date,
      caveats,
      comments,
      coordinator_first_name,
      coordinator_last_name,
      coordinator_email_address,
      coordinator_agency_name,
      geog
    ) VALUES (
      ${project.name},
      ${project.objectives},
      ${project.scientific_collection_permit_number},
      ${project.management_recovery_action},
      ${project.location_description},
      ${project.start_date},
      ${project.end_date},
      ${project.caveats},
      ${project.comments},
      ${project.coordinator_first_name},
      ${project.coordinator_last_name},
      ${project.coordinator_email_address},
      ${project.coordinator_agency_name}
  `;

  if (project.geometry && project.geometry.length) {
    const geometryCollectionSQL = generateGeometryCollectionSQL(project.geometry);

    sqlStatement.append(SQL`
      ,public.geography(
        public.ST_Force2D(
          public.ST_SetSRID(
    `);

    sqlStatement.append(geometryCollectionSQL);

    sqlStatement.append(SQL`
      , 4326)))
    `);
  } else {
    sqlStatement.append(SQL`
      ,null
    `);
  }

  sqlStatement.append(SQL`
    )
    RETURNING
      id;
  `);

  defaultLog.debug({
    label: 'postProjectSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to insert a focal species row.
 *
 * @param {PostSpeciesObject} species
 * @returns {SQLStatement} sql query object
 */
export const postFocalSpeciesSQL = (species: PostSpeciesObject, projectId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'postFocalSpeciesSQL', message: 'params', postFocalSpeciesSQL, projectId });

  if (!species || !projectId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
      INSERT INTO focal_species (
        p_id,
        name
      ) VALUES (
        ${projectId},
        ${species.name}
      )
      RETURNING
        id;
    `;

  defaultLog.debug({
    label: 'postFocalSpeciesSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to insert a ancillary species row.
 *
 * @param {PostSpeciesObject} species
 * @returns {SQLStatement} sql query object
 */
export const postAncillarySpeciesSQL = (species: PostSpeciesObject, projectId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'postAncillarySpeciesSQL', message: 'params', postAncillarySpeciesSQL, projectId });

  if (!species || !projectId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
        INSERT INTO ancillary_species (
          p_id,
          name
        ) VALUES (
          ${projectId},
          ${species.name}
        )
        RETURNING
          id;
      `;

  defaultLog.debug({
    label: 'postAncillarySpeciesSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get a single project.
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getProjectSQL = (projectId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getProjectSQL', message: 'params', projectId });

  if (!projectId) {
    return null;
  }

  // TODO pull the record wtih the latest revision_count?
  const sqlStatement = SQL`
    SELECT
      id,
      name,
      objectives,
      scientific_collection_permit_number,
      management_recovery_action,
      location_description,
      start_date,
      end_date,
      results,
      caveats,
      comments,
      coordinator_first_name,
      coordinator_last_name,
      coordinator_email_address,
      coordinator_agency_name,
      create_date,
      create_user,
      update_date,
      update_user,
      revision_count
    from
      project
    where
      id = ${projectId};
  `;

  defaultLog.debug({
    label: 'getProjectSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get all projects.
 *
 * @param {string} projectId
 * @returns {SQLStatement} sql query object
 */
export const getProjectsSQL = (): SQLStatement | null => {
  defaultLog.debug({ label: 'getProjectsSQL', message: 'SQL statement - retrieve projects' });

  // TODO these fields were chosen arbitrarily based on having a small
  const sqlStatement = SQL`
    SELECT
      id,
      name,
      scientific_collection_permit_number,
      management_recovery_action,
      to_char(start_date,'MM/DD/YYYY') as start_date,
      to_char(end_date,'MM/DD/YYYY') as end_date,
      location_description
    from
      project;
  `;

  defaultLog.debug({
    label: 'getProjectsSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to insert a project region row.
 *
 * @param {PostProjectRegionObject} projectRegion
 * @returns {SQLStatement} sql query object
 */
export const postProjectRegionSQL = (
  projectRegion: PostProjectRegionObject,
  projectId: number
): SQLStatement | null => {
  defaultLog.debug({ label: 'postProjectRegionSQL', message: 'params', postProjectRegionSQL, projectId });

  if (!projectRegion || !projectId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
      INSERT INTO project_region (
        p_id,
        region_name
      ) VALUES (
        ${projectId},
        ${projectRegion.region_name}
      )
      RETURNING
        id;
    `;

  defaultLog.debug({
    label: 'postProjectRegionSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

function generateGeometryCollectionSQL(geometry: Feature[]): SQLStatement {
  if (geometry.length === 1) {
    const geo = JSON.stringify(geometry[0].geometry);

    return SQL`public.ST_GeomFromGeoJSON(${geo})`;
  }

  const sqlStatement: SQLStatement = SQL`public.ST_AsText(public.ST_Collect(`;

  geometry.forEach((geom: Feature, index: number) => {
    const geo = JSON.stringify(geom.geometry);

    // as long as it is not the last geometry, keep adding to the ST_collect
    if (index !== geometry.length - 1) {
      sqlStatement.append(SQL`
        public.ST_GeomFromGeoJSON(${geo}),
      `);
    } else {
      sqlStatement.append(SQL`
        public.ST_GeomFromGeoJSON(${geo})))
      `);
    }
  });

  return sqlStatement;
}
