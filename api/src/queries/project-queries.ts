import { SQL, SQLStatement } from 'sql-template-strings';
import {
  PostCoordinatorData,
  PostFundingSource,
  PostLocationData,
  PostProjectData,
  PostObjectivesData,
  PostProjectObject
} from '../models/project';
import { getLogger } from '../utils/logger';
import { Feature } from 'geojson';

const defaultLog = getLogger('queries/project-queries');

/**
 * SQL query to insert a project row.
 *
 * @param {(PostProjectData & PostLocationData & PostCoordinatorData & PostObjectivesData)} project
 * @returns {SQLStatement} sql query object
 */
export const postProjectSQL = (
  project: PostProjectData & PostLocationData & PostCoordinatorData & PostObjectivesData
): SQLStatement | null => {
  defaultLog.debug({ label: 'postProjectSQL', message: 'params', PostProjectObject });

  if (!project) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    INSERT INTO project (
      pt_id,
      name,
      objectives,
      location_description,
      start_date,
      end_date,
      caveats,
      comments,
      coordinator_first_name,
      coordinator_last_name,
      coordinator_email_address,
      coordinator_agency_name,
      coordinator_public,
      geography
    ) VALUES (
      ${project.type},
      ${project.name},
      ${project.objectives},
      ${project.location_description},
      ${project.start_date},
      ${project.end_date},
      ${project.caveats},
      ${project.comments},
      ${project.first_name},
      ${project.last_name},
      ${project.email_address},
      ${project.coordinator_agency},
      ${project.share_contact_details}
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
 * @param {string} species
 * @returns {SQLStatement} sql query object
 */
export const postFocalSpeciesSQL = (species: string, projectId: number): SQLStatement | null => {
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
        ${species}
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
 * @param {string} species
 * @returns {SQLStatement} sql query object
 */
export const postAncillarySpeciesSQL = (species: string, projectId: number): SQLStatement | null => {
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
          ${species}
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
 * SQL query to insert a project region row.
 *
 * @param {string} region
 * @returns {SQLStatement} sql query object
 */
export const postProjectRegionSQL = (region: string, projectId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'postProjectRegionSQL', message: 'params', region, projectId });

  if (!region || !projectId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
      INSERT INTO project_region (
        p_id,
        name
      ) VALUES (
        ${projectId},
        ${region}
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

/**
 * SQL query to insert a project funding source row.
 *
 * @param {PostFundingSource} fundingSource
 * @returns {SQLStatement} sql query object
 */
export const postProjectFundingSourceSQL = (
  fundingSource: PostFundingSource,
  projectId: number
): SQLStatement | null => {
  defaultLog.debug({ label: 'postProjectFundingSourceSQL', message: 'params', fundingSource, projectId });

  if (!fundingSource || !projectId) {
    return null;
  }

  // TODO model is missing agency name
  const sqlStatement: SQLStatement = SQL`
      INSERT INTO project_funding_source (
        p_id,
        iac_id,
        funding_source_project_id,
        funding_amount,
        funding_start_date,
        funding_end_date
      ) VALUES (
        ${projectId},
        ${fundingSource.investment_action_category},
        ${fundingSource.agency_project_id},
        ${fundingSource.funding_amount},
        ${fundingSource.start_date},
        ${fundingSource.end_date}
      )
      RETURNING
        id;
    `;

  defaultLog.debug({
    label: 'postProjectFundingSourceSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to insert a project stakeholder partnership row.
 *
 * @param {string} stakeholderPartnership
 * @returns {SQLStatement} sql query object
 */
export const postProjectStakeholderPartnershipSQL = (
  stakeholderPartnership: string,
  projectId: number
): SQLStatement | null => {
  defaultLog.debug({
    label: 'postProjectStakeholderPartnershipSQL',
    message: 'params',
    stakeholderPartnership,
    projectId
  });

  if (!stakeholderPartnership || !projectId) {
    return null;
  }

  // TODO model is missing agency name
  const sqlStatement: SQLStatement = SQL`
      INSERT INTO stakeholder_partnership (
        p_id,
        name
      ) VALUES (
        ${projectId},
        ${stakeholderPartnership}
      )
      RETURNING
        id;
    `;

  defaultLog.debug({
    label: 'postPermitNumberWithSamplingSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to insert a project indigenous nation row.
 *
 * @param {string} indigenousNationId
 * @returns {SQLStatement} sql query object
 */
export const postProjectIndigenousNationSQL = (indigenousNationId: number, projectId: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'postProjectIndigenousNationSQL',
    message: 'params',
    indigenousNationId,
    projectId
  });

  if (!indigenousNationId || !projectId) {
    return null;
  }

  // TODO model is missing agency name
  const sqlStatement: SQLStatement = SQL`
      INSERT INTO project_first_nation (
        p_id,
        fn_id
      ) VALUES (
        ${projectId},
        ${indigenousNationId}
      )
      RETURNING
        id;
    `;

  defaultLog.debug({
    label: 'postProjectIndigenousNationSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/*
  Function to generate the SQL for insertion of a geometry collection
*/
function generateGeometryCollectionSQL(geometry: Feature[]): SQLStatement {
  if (geometry.length === 1) {
    const geo = JSON.stringify(geometry[0].geometry);

    return SQL`public.ST_GeomFromGeoJSON(${geo})`;
  }

  const sqlStatement: SQLStatement = SQL`public.ST_AsText(public.ST_Collect(array[`;

  geometry.forEach((geom: Feature, index: number) => {
    const geo = JSON.stringify(geom.geometry);

    // as long as it is not the last geometry, keep adding to the ST_collect
    if (index !== geometry.length - 1) {
      sqlStatement.append(SQL`
        public.ST_GeomFromGeoJSON(${geo}),
      `);
    } else {
      sqlStatement.append(SQL`
        public.ST_GeomFromGeoJSON(${geo})]))
      `);
    }
  });

  return sqlStatement;
}

/**
 * SQL query to insert a project permit row.
 *
 * @param permit_number
 * @param projectId
 * @param sampling_conducted
 * @returns {SQLStatement} sql query object
 */
export const postProjectPermitSQL = (
  permit_number: string,
  projectId: number,
  sampling_conducted: boolean
): SQLStatement | null => {
  defaultLog.debug({
    label: 'postProjectPermitSQL',
    message: 'params',
    permit_number,
    sampling_conducted,
    projectId
  });

  if (!permit_number || !projectId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
      INSERT INTO project_permit (
        p_id,
        number,
        sampling_conducted
      ) VALUES (
        ${projectId},
        ${permit_number},
        ${sampling_conducted}
      )
      RETURNING
        id;
    `;

  defaultLog.debug({
    label: 'postProjectPermitSQL',
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
      project.id,
      project.pt_id,
      project_type.name as pt_name,
      project.name,
      project.objectives,
      project.location_description,
      project.start_date,
      project.end_date,
      project.caveats,
      project.comments,
      project.coordinator_first_name,
      project.coordinator_last_name,
      project.coordinator_email_address,
      project.coordinator_agency_name,
      project.coordinator_public,
      public.ST_asGeoJSON(project.geography) as geometry,
      project.create_date,
      project.create_user,
      project.update_date,
      project.update_user,
      project.revision_count
    from
      project
    left outer join
      project_type
        on project.pt_id = project_type.id
    where
      project.id = ${projectId};
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
export const getProjectListSQL = (): SQLStatement | null => {
  defaultLog.debug({ label: 'getProjectListSQL', message: 'getProjectListSQL' });

  // TODO these fields were chosen arbitrarily based on having a small
  const sqlStatement = SQL`
    SELECT
      p.id,
      p.name,
      p.start_date,
      p.end_date,
      p.location_description,
      string_agg(DISTINCT pr.name, ', ') as regions_name_list,
      string_agg(DISTINCT pfs.name, ', ') as focal_species_name_list
    from
      project as p
    left outer join project_region as pr
      on p.id = pr.p_id
    left outer join focal_species as pfs
      on p.id = pfs.p_id
    group by
      p.id,
      p.name,
      p.start_date,
      p.end_date,
      p.location_description;
  `;

  defaultLog.debug({
    label: 'getProjectListSQL',
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

export const getRegionsByProjectSQL = (projectId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getRegionsByProjectSQL', message: 'params', projectId });

  if (!projectId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      id,
      name
    from
      project_region
    where p_id = ${projectId};
  `;

  defaultLog.debug({
    label: 'getRegionsByProjectSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get project activities.
 *
 * @param {string} projectId
 * @returns {SQLStatement} sql query object
 */

export const getActivitiesByProjectSQL = (projectId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getActivitiesByProjectSQL', message: 'params', projectId });

  if (!projectId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      id,
      a_id,
      revision_count
    from
      project_activity
    where p_id = ${projectId};
  `;

  defaultLog.debug({
    label: 'getActivitiesByProjectSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get project climate initiatives.
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getClimateInitiativesByProjectSQL = (projectId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getClimateInitiativesByProjectSQL', message: 'params', projectId });

  if (!projectId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      id,
      cci_id,
      revision_count
    from
      project_climate_initiative
    where p_id = ${projectId};
  `;

  defaultLog.debug({
    label: 'getClimateInitiativesByProjectSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get project focal species.
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getFocalSpeciesByProjectSQL = (projectId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getFocalSpeciesByProjectSQL', message: 'params', projectId });

  if (!projectId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      name
    FROM
      focal_species
    where p_id = ${projectId};
  `;

  defaultLog.debug({
    label: 'getFocalSpeciesByProjectSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get project ancillary species.
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getAncillarySpeciesByProjectSQL = (projectId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getAncillarySpeciesByProjectSQL', message: 'params', projectId });

  if (!projectId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      name
    FROM
      ancillary_species
    where p_id = ${projectId};
  `;

  defaultLog.debug({
    label: 'getAncillarySpeciesByProjectSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get IUCN action classifications.
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getIUCNActionClassificationByProjectSQL = (projectId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getIUCNActionClassificationByProjectSQL', message: 'params', projectId });

  if (!projectId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      ical1c.name as classification,
      ical2s.name as subClassification1,
      ical3s.name as subClassification2
    FROM
      project_iucn_action_classificaton as piac
    LEFT OUTER JOIN
      iucn_conservation_action_level_3_subclassification as ical3s
    ON
      piac.iucn2_id = ical3s.id
    LEFT OUTER JOIN
      iucn_conservation_action_level_2_subclassification as ical2s
    ON
      ical3s.iucn1_id = ical2s.id
    LEFT OUTER JOIN
      iucn_conservation_action_level_1_classification as ical1c
    ON
      ical2s.iucn_id = ical1c.id
    WHERE
      piac.p_id = ${projectId}
    GROUP BY
      ical2s.name,
      ical1c.name,
      ical3s.name;
  `;

  defaultLog.debug({
    label: 'getIUCNActionClassificationByProjectSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to insert a project IUCN row.
 *
 * @param iucn_id
 * @param project_id
 * @returns {SQLStatement} sql query object
 */
export const postProjectIUCNSQL = (iucn_id: number, project_id: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'postProjectIUCNSQL',
    message: 'params',
    iucn_id,
    project_id
  });

  if (!iucn_id || !project_id) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
      INSERT INTO project_iucn_action_classificaton (
        iucn2_id,
        p_id
      ) VALUES (
        ${iucn_id},
        ${project_id}
      )
      RETURNING
        id;
    `;

  defaultLog.debug({
    label: 'postProjectIUCNSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to insert a project activity row.
 *
 * @param activityId
 * @param projectId
 * @returns {SQLStatement} sql query object
 */
export const postProjectActivitySQL = (activityId: number, projectId: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'postProjectActivity',
    message: 'params',
    activityId,
    projectId
  });

  if (!activityId || !projectId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
      INSERT INTO project_activity (
        a_id,
        p_id
      ) VALUES (
        ${activityId},
        ${projectId}
      )
      RETURNING
        id;
    `;

  defaultLog.debug({
    label: 'postProjectActivity',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to insert a climate initiative row.
 *
 * @param climateChangeInitiativeId
 * @param projectId
 * @returns {SQLStatement} sql query object
 */
export const postProjectClimateChangeInitiativeSQL = (
  climateChangeInitiativeId: number,
  projectId: number
): SQLStatement | null => {
  defaultLog.debug({
    label: 'postProjectClimateChangeInitiativeSQL',
    message: 'params',
    climateChangeInitiativeId,
    projectId
  });

  if (!climateChangeInitiativeId || !projectId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
      INSERT INTO project_climate_initiative (
        cci_id,
        p_id
      ) VALUES (
        ${climateChangeInitiativeId},
        ${projectId}
      )
      RETURNING
        id;
    `;

  defaultLog.debug({
    label: 'postProjectClimateChangeInitiativeSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
