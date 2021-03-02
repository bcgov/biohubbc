import { SQL, SQLStatement } from 'sql-template-strings';
import {
  PostCoordinatorData,
  PostFundingSource,
  PostLocationData,
  PostProjectData,
  PostProjectObject
} from '../models/project';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('queries/project-queries');

/**
 * SQL query to insert a project row.
 *
 * @param {(PostProjectData & PostLocationData)} project
 * @returns {SQLStatement} sql query object
 */
export const postProjectSQL = (
  project: PostProjectData & PostLocationData & PostCoordinatorData
): SQLStatement | null => {
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
      coordinator_agency_name
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
      ${project.first_name},
      ${project.last_name},
      ${project.email_address},
      ${project.coordinator_agency}
    )
    RETURNING
      id;
  `;

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
  defaultLog.debug({ label: 'getProjectsSQL', message: 'getProjectsSQL' });

  // TODO these fields were chosen arbitrarily based on having a small
  const sqlStatement = SQL`
    SELECT
      p.id,
      p.name,
      p.scientific_collection_permit_number,
      p.management_recovery_action,
      to_char(p.start_date,'MM/DD/YYYY') as start_date,
      to_char(p.end_date,'MM/DD/YYYY') as end_date,
      p.location_description,
      string_agg(pr.region_name, ', ') as regions_name_list,
      string_agg(pfs.name, ', ') as focal_species_name_list
    from
      project as p
    left outer join project_region as pr
      on p.id = pr.p_id
    left outer join focal_species as pfs
      on p.id = pfs.p_id
    group by
      p.id,
      p.name,
      p.scientific_collection_permit_number,
      p.management_recovery_action,
      p.start_date,
      p.end_date,
      p.location_description,
      pr.region_name,
      pfs.name ;
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
        region_name
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
    label: 'postProjectStakeholderPartnershipSQL',
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
