import AdmZip from 'adm-zip';
import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import * as xml2js from 'xml2js';
import { PROJECT_ROLE, SYSTEM_ROLE } from '../../constants/roles';
import { getDBConnection, IDBConnection } from '../../database/db';
import { HTTP400, HTTP500 } from '../../errors/custom-error';
import { queries } from '../../queries/queries';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { getDbCharacterSystemMetaDataConstant } from '../../utils/db-constant-utils';
import { getFileFromS3, uploadBufferToS3 } from '../../utils/file-utils';
import { getLogger } from '../../utils/logger';
import { MediaFile } from '../../utils/media/media-file';
import { parseS3File, parseUnknownZipFile } from '../../utils/media/media-utils';

const simsEmlVersion = '1.0.0';

type Eml = { [k: string]: any };

const defaultLog = getLogger('paths/dwc/eml');

const defaultEMLFileName = 'eml.xml';
const defaultEMLMimeType = 'application/xml';
const defaultArchiveMimeType = 'application/zip';

export const POST: Operation = [
  authorizeRequestHandler((req) => {
    return {
      and: [
        {
          validProjectRoles: [PROJECT_ROLE.PROJECT_LEAD, PROJECT_ROLE.PROJECT_EDITOR],
          projectId: Number(req.body.project_id),
          discriminator: 'ProjectRole'
        }
      ]
    };
  }),
  getSurveyDataPackageEML(),
  sendResponse()
];

POST.apiDoc = {
  description: 'Produces an Ecological Metadata Language (EML) extract for a target data package.',
  tags: ['eml', 'dwc'],
  security: [
    {
      Bearer: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.PROJECT_CREATOR]
    }
  ],
  requestBody: {
    description: 'Request body',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['data_package_id'],
          properties: {
            project_id: {
              type: 'number'
            },
            data_package_id: {
              description: 'A data package ID',
              type: 'number',
              example: 1
            },
            supplied_title: {
              description: 'A user supplied title',
              type: 'string',
              example: 'My dataset title'
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Ecological Metadata Language (EML) extract production OK'
    },
    400: {
      $ref: '#/components/responses/400'
    },
    401: {
      $ref: '#/components/responses/401'
    },
    403: {
      $ref: '#/components/responses/403'
    },
    500: {
      $ref: '#/components/responses/500'
    },
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

export function getSurveyDataPackageEML(): RequestHandler {
  return async (req, res, next) => {
    defaultLog.debug({ label: 'getSurveyDataPackageEML', message: 'params', files: req.body });

    const connection = getDBConnection(req['keycloak_token']);

    if (!req.body.data_package_id) {
      throw new HTTP400('Missing required body param `data_package_id`.');
    }

    try {
      await connection.open();

      // get required data
      const occurrenceSubmission = await getSurveyOccurrenceSubmission(req.body.data_package_id, connection);

      // get the EML data for the survey
      const dataPackageEML = await getDataPackageEML(req.body.data_package_id, connection, req.body.supplied_title);

      await connection.commit();

      // get the archive file from s3
      if (!occurrenceSubmission.output_key) {
        throw new HTTP400('No S3 target output key found');
      }
      const s3Key = occurrenceSubmission.output_key;
      const s3File = await getFileFromS3(s3Key);

      if (!s3File) {
        throw new HTTP500('Failed to get file from S3');
      }

      // parse the archive file and add EML file
      const archiveFile = parseS3File(s3File);
      const mediaFiles = parseUnknownZipFile(archiveFile.buffer);
      mediaFiles.push(new MediaFile(defaultEMLFileName, defaultEMLMimeType, Buffer.from(dataPackageEML)));

      // build the archive zip file
      const dwcArchiveZip = new AdmZip();
      mediaFiles.forEach((file) => dwcArchiveZip.addFile(file.fileName, file.buffer));

      // upload archive to s3
      await uploadBufferToS3(dwcArchiveZip.toBuffer(), defaultArchiveMimeType, s3Key);

      next();
    } catch (error) {
      defaultLog.error({ label: 'getSurveyDataPackageEML', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}

export function sendResponse(): RequestHandler {
  return async (req, res) => {
    return res.status(200).send();
  };
}

/**
 * Get database application constants value.
 *
 * @param {number} dataPackageId
 * @param {IDBConnection} connection
 * @param {string} suppliedTitle
 * @return {*} {Promise<void>}
 */
export const getDataPackageEML = async (
  dataPackageId: number,
  connection: IDBConnection,
  suppliedTitle?: string
): Promise<any> => {
  defaultLog.debug({
    label: 'getDataPackageEML',
    message: 'params',
    dataPackageId,
    suppliedTitle
  });

  // get all required data
  const dataPackage = await getDataPackage(dataPackageId, connection);
  const occurrenceSubmission = await getSurveyOccurrenceSubmission(dataPackageId, connection);
  const publishedSurveyStatus = await getPublishedSurveyStatus(
    occurrenceSubmission.occurrence_submission_id,
    connection
  );
  const survey = await getSurvey(occurrenceSubmission.survey_id, connection);
  const project = await getProject(survey.project_id, connection);
  const surveyFundingSource = await getSurveyFundingSource(survey.survey_id, connection);
  const projectFundingSource = await getProjectFundingSource(project.project_id, connection);
  const surveyBoundingBox = await getSurveyBoundingBox(survey.survey_id, connection);
  const surveyPolygons = await getSurveyPolygons(survey.survey_id, connection);
  const projectBoundingBox = await getProjectBoundingBox(project.project_id, connection);
  const projectPolygons = await getProjectPolygons(project.project_id, connection);
  const focalTaxonomicCoverage = await getFocalTaxonomicCoverage(survey.survey_id, connection);
  const projectIucnConservation = await getProjectIucnConservation(project.project_id, connection);
  const projectStakeholderPartnership = await getProjectStakeholderPartnership(project.project_id, connection);
  const projectActivity = await getProjectActivity(project.project_id, connection);
  const projectClimateInitiative = await getProjectClimateInitiative(project.project_id, connection);
  const projectFirstNations = await getProjectFirstNations(project.project_id, connection);
  const projectManagementActions = await getProjectManagementActions(project.project_id, connection);
  const surveyProprietor = await getSurveyProprietor(survey.survey_id, connection);
  // database constants
  const simsProviderURL = checkProvided(await getDbCharacterSystemMetaDataConstant('PROVIDER_URL', connection));
  const securityProviderURL = checkProvided(
    await getDbCharacterSystemMetaDataConstant('SECURITY_PROVIDER_URL', connection)
  );
  const organizationFullName = checkProvided(
    await getDbCharacterSystemMetaDataConstant('ORGANIZATION_NAME_FULL', connection)
  );
  const organizationURL = checkProvided(await getDbCharacterSystemMetaDataConstant('ORGANIZATION_URL', connection));
  const intellectualRights = checkProvided(
    await getDbCharacterSystemMetaDataConstant('INTELLECTUAL_RIGHTS', connection)
  );
  const taxonomicProviderURL = checkProvided(
    await getDbCharacterSystemMetaDataConstant('TAXONOMIC_PROVIDER_URL', connection)
  );

  // build eml object
  const eml: Eml = {
    'eml:eml': {
      $: {
        packageId: 'urn:uuid:' + dataPackage.uuid,
        system: simsProviderURL,
        'xmlns:eml': 'https://eml.ecoinformatics.org/eml-2.2.0',
        'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
        'xmlns:stmml': 'http://www.xml-cml.org/schema/stmml-1.1',
        'xsi:schemaLocation': 'https://eml.ecoinformatics.org/eml-2.2.0 xsd/eml.xsd'
      }
    }
  };

  const emlRoot = eml['eml:eml'];

  emlRoot.access = {
    $: { authSystem: securityProviderURL, order: 'allowFirst' },
    allow: { principal: 'public', permission: 'read' }
  };

  emlRoot.dataset = { $: { system: simsProviderURL, id: dataPackage.uuid } };

  if (suppliedTitle) {
    emlRoot.dataset.title = suppliedTitle;
  } else if (dataPackage) {
    emlRoot.dataset.title = dataPackage.uuid;
  }

  emlRoot.dataset.creator = { organizationName: project.coordinator_agency_name };

  emlRoot.dataset.metadataProvider = { organizationName: organizationFullName, onlineUrl: organizationURL };

  // TODO determine if this can be called without a publish date and if so what value to use?
  emlRoot.dataset.pubDate = publishedSurveyStatus.rows[0].status_event_timestamp.toISOString().split('T')[0];

  emlRoot.dataset.language = 'english';

  emlRoot.dataset.intellectualRights = { para: intellectualRights };

  emlRoot.dataset.contact = {};
  if (project.coordinator_public) {
    emlRoot.dataset.contact = {
      individualName: { givenName: project.coordinator_first_name, surName: project.coordinator_last_name },
      electronicMailAddress: project.coordinator_email_address
    };
  } else {
    emlRoot.dataset.contact = { organizationName: organizationFullName, onlineUrl: organizationURL };
  }

  // both projects and surveys are represented as "projects" in EML
  // main EML "project" is the survey
  emlRoot.dataset.project = { $: { id: survey.uuid, system: simsProviderURL }, title: survey.name };
  if (project.coordinator_public) {
    emlRoot.dataset.project.personnel = {
      individualName: { givenName: survey.lead_first_name, surName: survey.lead_last_name },
      organizationName: project.coordinator_agency_name,
      role: 'pointOfContact'
    };
  } else {
    emlRoot.dataset.project.personnel = {
      organizationName: organizationFullName,
      onlineUrl: organizationURL,
      role: 'custodianSteward'
    };
  }

  emlRoot.dataset.project.abstract = { section: { title: 'Objectives', para: survey.objectives } };

  if (surveyFundingSource.length) {
    emlRoot.dataset.project.funding = getFundingEML(surveyFundingSource);
  }

  emlRoot.dataset.project.studyAreaDescription = { coverage: {} };
  const surveyGeographicDescription = survey.location_description
    ? survey.location_name + ' - ' + survey.location_description
    : survey.location_name;
  emlRoot.dataset.project.studyAreaDescription.coverage.geographicCoverage = getGeographicCoverageEML(
    surveyGeographicDescription,
    surveyBoundingBox,
    surveyPolygons
  );

  emlRoot.dataset.project.studyAreaDescription.coverage.temporalCoverage = getTemporalCoverageEML(survey);

  emlRoot.dataset.project.studyAreaDescription.coverage.taxonomicCoverage = { taxonomicClassification: [] };
  focalTaxonomicCoverage.rows.forEach(function (row: any, i: number) {
    emlRoot.dataset.project.studyAreaDescription.coverage.taxonomicCoverage.taxonomicClassification[i] = {
      taxonRankName: row.tty_name,
      taxonRankValue: row.unit_name1 + ' ' + row.unit_name2,
      commonName: row.english_name,
      taxonId: { $: { provider: taxonomicProviderURL }, _: row.code }
    };
  });

  emlRoot.dataset.project.relatedProject = { $: { id: project.uuid, system: simsProviderURL }, title: project.name };
  if (project.coordinator_public) {
    emlRoot.dataset.project.relatedProject.personnel = {
      individualName: { givenName: project.coordinator_first_name, surName: project.coordinator_last_name },
      organizationName: project.coordinator_agency_name,
      electronicMailAddress: project.coordinator_email_address,
      role: 'pointOfContact'
    };
  } else {
    emlRoot.dataset.project.relatedProject.personnel = {
      organizationName: organizationFullName,
      onlineUrl: organizationURL,
      role: 'custodianSteward'
    };
  }

  emlRoot.dataset.project.relatedProject.abstract = {
    section: [
      { title: 'Objectives', para: project.objectives },
      { title: 'Caveats', para: project.caveats },
      { title: 'Comments', para: project.comments }
    ]
  };

  if (projectFundingSource.length) {
    emlRoot.dataset.project.relatedProject.funding = getFundingEML(projectFundingSource);
  }

  emlRoot.dataset.project.relatedProject.studyAreaDescription = { coverage: {} };
  emlRoot.dataset.project.relatedProject.studyAreaDescription.coverage.geographicCoverage = getGeographicCoverageEML(
    checkProvided(project.location_description),
    projectBoundingBox,
    projectPolygons
  );

  emlRoot.additionalMetadata = [];
  let additionalMetadataCount = 0;
  emlRoot.additionalMetadata[additionalMetadataCount] = {
    describes: dataPackage.uuid,
    metadata: { simsEML: { type: 'survey', version: simsEmlVersion } }
  };

  if (projectIucnConservation.rowCount) {
    additionalMetadataCount++;
    emlRoot.additionalMetadata[additionalMetadataCount] = {
      describes: project.uuid,
      metadata: { IUCNConservationActions: { IUCNConservationAction: [] } }
    };
    projectIucnConservation.rows.forEach(function (row: any, i: number) {
      emlRoot.additionalMetadata[additionalMetadataCount].metadata.IUCNConservationActions.IUCNConservationAction[i] = {
        IUCNConservationActionLevel1Classification: row.level_1_name,
        IUCNConservationActionLevel2SubClassification: row.level_2_name,
        IUCNConservationActionLevel3SubClassification: row.level_3_name
      };
    });
  }

  if (projectStakeholderPartnership.rowCount) {
    additionalMetadataCount++;
    emlRoot.additionalMetadata[additionalMetadataCount] = {
      describes: project.uuid,
      metadata: { stakeholderPartnerships: { stakeholderPartnership: [] } }
    };
    projectStakeholderPartnership.rows.forEach(function (row: any, i: number) {
      emlRoot.additionalMetadata[additionalMetadataCount].metadata.stakeholderPartnerships.stakeholderPartnership[i] = {
        name: row.name
      };
    });
  }

  if (projectActivity.rowCount) {
    additionalMetadataCount++;
    emlRoot.additionalMetadata[additionalMetadataCount] = {
      describes: project.uuid,
      metadata: { projectActivities: { projectActivity: [] } }
    };
    projectActivity.rows.forEach(function (row: any, i: number) {
      emlRoot.additionalMetadata[additionalMetadataCount].metadata.projectActivities.projectActivity[i] = {
        name: row.name
      };
    });
  }

  if (projectClimateInitiative.rowCount) {
    additionalMetadataCount++;
    emlRoot.additionalMetadata[additionalMetadataCount] = {
      describes: project.uuid,
      metadata: { climateChangeInitiatives: { climateChangeInitiative: [] } }
    };
    projectClimateInitiative.rows.forEach(function (row: any, i: number) {
      emlRoot.additionalMetadata[additionalMetadataCount].metadata.climateChangeInitiatives.climateChangeInitiative[
        i
      ] = {
        name: row.name
      };
    });
  }

  if (projectFirstNations.rowCount) {
    additionalMetadataCount++;
    emlRoot.additionalMetadata[additionalMetadataCount] = {
      describes: project.uuid,
      metadata: { firstNations: { firstNation: [] } }
    };
    projectFirstNations.rows.forEach(function (row: any, i: number) {
      emlRoot.additionalMetadata[additionalMetadataCount].metadata.firstNations.firstNation[i] = {
        name: row.name
      };
    });
  }

  if (projectManagementActions.rowCount) {
    additionalMetadataCount++;
    emlRoot.additionalMetadata[additionalMetadataCount] = {
      describes: project.uuid,
      metadata: { managementActionTypes: { managementActionType: [] } }
    };
    projectManagementActions.rows.forEach(function (row: any, i: number) {
      emlRoot.additionalMetadata[additionalMetadataCount].metadata.managementActionTypes.managementActionType[i] = {
        name: row.name
      };
    });
  }

  if (surveyProprietor.rowCount) {
    additionalMetadataCount++;
    emlRoot.additionalMetadata[additionalMetadataCount] = {
      describes: project.uuid,
      metadata: { surveyProprietors: { surveyProprietor: [] } }
    };
    surveyProprietor.rows.forEach(function (row: any, i: number) {
      emlRoot.additionalMetadata[additionalMetadataCount].metadata.surveyProprietors.surveyProprietor[i] = {
        firstNationsName: row.first_nations_name,
        proprietorType: row.proprietor_type_name,
        rationale: row.rationale,
        proprietorName: row.proprietor_name,
        DISARequired: row.disa_required ? 'YES' : 'NO'
      };
    });
  }

  // convert object to xml
  const builder = new xml2js.Builder();
  return builder.buildObject(eml);
};

/**
 * Return temporal coverage eml.
 *
 * @param {*} projectRow
 * @return {Eml}
 */
const getTemporalCoverageEML = (projectRow: any): Eml => {
  const temporalCoverage: Eml = {
    rangeOfDates: { beginDate: { calendarDate: projectRow.start_date }, endDate: { calendarDate: projectRow.end_date } }
  };

  return temporalCoverage;
};

/**
 * Return geographic coverage eml.
 *
 * @param {string} geographicDescription
 * @param {BoundingBox} boundingBox
 * @param {*} polygonRows
 * @return {Eml}
 */
const getGeographicCoverageEML = (geographicDescription: string, boundingBox: any, polygonRows: any): Eml => {
  const geographicCoverage: Eml = {
    geographicDescription: geographicDescription,
    boundingCoordinates: {
      westBoundingCoordinate: boundingBox.st_xmin,
      eastBoundingCoordinate: boundingBox.st_xmax,
      northBoundingCoordinate: boundingBox.st_ymax,
      southBoundingCoordinate: boundingBox.st_ymin
    }
  };
  geographicCoverage.datasetGPolygon = [];
  polygonRows.rows.forEach(function (row: any, i: number) {
    geographicCoverage.datasetGPolygon[i] = { datasetGPolygonOuterGRing: { gRingPoint: [] } };
    row.points.forEach(function (point: any, g: number) {
      geographicCoverage.datasetGPolygon[i].datasetGPolygonOuterGRing.gRingPoint[g] = {
        gRingLatitude: point[0],
        gRingLongitude: point[1]
      };
    });
  });

  return geographicCoverage;
};

/**
 * Return funding source eml.
 *
 * @param {any[]} fundingSourceRows
 * @return {Eml}
 */
const getFundingEML = (fundingSourceRows: any[]): Eml => {
  const funding: Eml = { section: [] };

  fundingSourceRows.forEach(function (row: any, i: number) {
    funding.section[i] = { title: 'Funding Source', para: row.funding_source_name };
    funding.section[i].section = {
      title: 'Investment Action Category',
      para: row.investment_action_category_name,
      section: [
        { title: 'Funding Source Project ID', para: row.funding_source_project_id },
        { title: 'Funding Amount', para: row.funding_amount },
        { title: 'Funding Start Date', para: new Date(row.funding_start_date).toISOString().split('T')[0] },
        { title: 'Funding End Date', para: new Date(row.funding_end_date).toISOString().split('T')[0] }
      ]
    };
  });

  return funding;
};

type StringIfNull<T> = T extends null | undefined ? string : T;

/**
 * Return default message if value not provided.
 *
 * @param {string} valueToCheck
 * @param {IDBConnection} connection
 * @return {string | number}
 */
const checkProvided = <T extends string | number | null>(valueToCheck: T): StringIfNull<T> => {
  // the EML specification requires all fields have values
  // fail gracefully by providing standard message that data is not supplied
  const notSuppliedMessage = 'Not Supplied';

  if (valueToCheck === null) {
    return notSuppliedMessage as StringIfNull<T>;
  }

  return valueToCheck as StringIfNull<T>;
};

/**
 * Get occurrence submission record associated with data package ID.
 *
 * @param {number} data_package_id
 * @param {IDBConnection} connection
 * @return {*} {Promise<void>}
 */
export const getSurveyOccurrenceSubmission = async (dataPackageId: number, connection: IDBConnection): Promise<any> => {
  const sqlStatement = queries.dwc.getSurveyOccurrenceSubmissionSQL(dataPackageId);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  if (!response || response.rowCount != 1) {
    throw new HTTP400('Failed to acquire distinct survey occurrence submission record');
  }

  return response.rows[0];
};

/**
 * Get data package record associated with data package ID.
 *
 * @param {number} data_package_id
 * @param {IDBConnection} connection
 * @return {*} {Promise<void>}
 */
export const getDataPackage = async (dataPackageId: number, connection: IDBConnection): Promise<any> => {
  const sqlStatement = queries.dwc.getDataPackageSQL(dataPackageId);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  if (!response || !response.rowCount) {
    throw new HTTP400('Failed to acquire data package record');
  }

  return response.rows[0];
};

/**
 * Get published survey status.
 *
 * @param {number} data_package_id
 * @param {IDBConnection} connection
 * @return {*} {Promise<void>}
 */
export const getPublishedSurveyStatus = async (
  occurrenceSubmissionId: number,
  connection: IDBConnection
): Promise<any> => {
  const sqlStatement = queries.dwc.getPublishedSurveyStatusSQL(occurrenceSubmissionId);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL statement');
  }

  return connection.query(sqlStatement.text, sqlStatement.values);
};

/**
 * Get survey record.
 *
 * @param {number} surveyId
 * @param {IDBConnection} connection
 * @return {*} {Promise<void>}
 */
export const getSurvey = async (surveyId: number, connection: IDBConnection): Promise<any> => {
  const sqlStatement = queries.dwc.getSurveySQL(surveyId);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL statement');
  }

  return (await connection.query(sqlStatement.text, sqlStatement.values)).rows[0];
};

/**
 * Get project record.
 *
 * @param {number} projectId
 * @param {IDBConnection} connection
 * @return {*} {Promise<void>}
 */
export const getProject = async (projectId: number, connection: IDBConnection): Promise<any> => {
  const sqlStatement = queries.dwc.getProjectSQL(projectId);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL statement');
  }

  return (await connection.query(sqlStatement.text, sqlStatement.values)).rows[0];
};

/**
 * Get survey funding source records.
 *
 * @param {number} surveyId
 * @param {IDBConnection} connection
 * @return {*} {Promise<any[]>}
 */
export const getSurveyFundingSource = async (surveyId: number, connection: IDBConnection): Promise<any[]> => {
  const sqlStatement = queries.dwc.getSurveyFundingSourceSQL(surveyId);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL statement');
  }

  return (await connection.query(sqlStatement.text, sqlStatement.values)).rows;
};

/**
 * Get project funding source records.
 *
 * @param {number} projectId
 * @param {IDBConnection} connection
 * @return {*} {Promise<any[]>}
 */
export const getProjectFundingSource = async (projectId: number, connection: IDBConnection): Promise<any[]> => {
  const sqlStatement = queries.dwc.getProjectFundingSourceSQL(projectId);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL statement');
  }

  return (await connection.query(sqlStatement.text, sqlStatement.values)).rows;
};

/**
 * Get survey bounding box.
 *
 * @param {number} surveyId
 * @param {IDBConnection} connection
 * @return {BoundingBox} {Promise<BoundingBox>}
 */
export const getSurveyBoundingBox = async (surveyId: number, connection: IDBConnection): Promise<any> => {
  const sqlStatement = queries.dwc.getGeometryBoundingBoxSQL(surveyId, 'survey_id', 'survey');

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL statement');
  }

  return (await connection.query(sqlStatement.text, sqlStatement.values)).rows[0];
};

/**
 * Get project bounding box.
 *
 * @param {number} projectId
 * @param {IDBConnection} connection
 * @return {BoundingBox} {Promise<BoundingBox>}
 */
export const getProjectBoundingBox = async (projectId: number, connection: IDBConnection): Promise<any> => {
  const sqlStatement = queries.dwc.getGeometryBoundingBoxSQL(projectId, 'project_id', 'project');

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL statement');
  }

  return (await connection.query(sqlStatement.text, sqlStatement.values)).rows[0];
};

/**
 * Get survey polygons.
 *
 * @param {number} surveyId
 * @param {IDBConnection} connection
 * @return {*} {Promise<void>}
 */
export const getSurveyPolygons = async (surveyId: number, connection: IDBConnection): Promise<any> => {
  const sqlStatement = queries.dwc.getGeometryPolygonsSQL(surveyId, 'survey_id', 'survey');

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL statement');
  }

  return connection.query(sqlStatement.text, sqlStatement.values);
};

/**
 * Get project polygons.
 *
 * @param {number} projectId
 * @param {IDBConnection} connection
 * @return {*} {Promise<void>}
 */
export const getProjectPolygons = async (projectId: number, connection: IDBConnection): Promise<any> => {
  const sqlStatement = queries.dwc.getGeometryPolygonsSQL(projectId, 'project_id', 'project');

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL statement');
  }

  return connection.query(sqlStatement.text, sqlStatement.values);
};

/**
 * Get focal taxonomic coverage.
 *
 * @param {number} surveyId
 * @param {IDBConnection} connection
 * @return {*} {Promise<void>}
 */
export const getFocalTaxonomicCoverage = async (surveyId: number, connection: IDBConnection): Promise<any> => {
  const sqlStatement = queries.dwc.getTaxonomicCoverageSQL(surveyId, true);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL statement');
  }

  return connection.query(sqlStatement.text, sqlStatement.values);
};

/**
 * Get project IUCN conservation data.
 *
 * @param {number} projectId
 * @param {IDBConnection} connection
 * @return {*} {Promise<void>}
 */
export const getProjectIucnConservation = async (projectId: number, connection: IDBConnection): Promise<any> => {
  const sqlStatement = queries.dwc.getProjectIucnConservationSQL(projectId);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL statement');
  }

  return connection.query(sqlStatement.text, sqlStatement.values);
};

/**
 * Get project stakeholder partnership data.
 *
 * @param {number} projectId
 * @param {IDBConnection} connection
 * @return {*} {Promise<void>}
 */
export const getProjectStakeholderPartnership = async (projectId: number, connection: IDBConnection): Promise<any> => {
  const sqlStatement = queries.dwc.getProjectStakeholderPartnershipSQL(projectId);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL statement');
  }

  return connection.query(sqlStatement.text, sqlStatement.values);
};

/**
 * Get project activity data.
 *
 * @param {number} projectId
 * @param {IDBConnection} connection
 * @return {*} {Promise<void>}
 */
export const getProjectActivity = async (projectId: number, connection: IDBConnection): Promise<any> => {
  const sqlStatement = queries.dwc.getProjectActivitySQL(projectId);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL statement');
  }

  return connection.query(sqlStatement.text, sqlStatement.values);
};

/**
 * Get project climate initiative data.
 *
 * @param {number} projectId
 * @param {IDBConnection} connection
 * @return {*} {Promise<void>}
 */
export const getProjectClimateInitiative = async (projectId: number, connection: IDBConnection): Promise<any> => {
  const sqlStatement = queries.dwc.getProjectClimateInitiativeSQL(projectId);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL statement');
  }

  return connection.query(sqlStatement.text, sqlStatement.values);
};

/**
 * Get project first nations data.
 *
 * @param {number} projectId
 * @param {IDBConnection} connection
 * @return {*} {Promise<void>}
 */
export const getProjectFirstNations = async (projectId: number, connection: IDBConnection): Promise<any> => {
  const sqlStatement = queries.dwc.getProjectFirstNationsSQL(projectId);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL statement');
  }

  return connection.query(sqlStatement.text, sqlStatement.values);
};

/**
 * Get project management action data.
 *
 * @param {number} projectId
 * @param {IDBConnection} connection
 * @return {*} {Promise<void>}
 */
export const getProjectManagementActions = async (projectId: number, connection: IDBConnection): Promise<any> => {
  const sqlStatement = queries.dwc.getProjectManagementActionsSQL(projectId);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL statement');
  }

  return connection.query(sqlStatement.text, sqlStatement.values);
};

/**
 * Get project survey proprietor data.
 *
 * @param {number} projectId
 * @param {IDBConnection} connection
 * @return {*} {Promise<void>}
 */
export const getSurveyProprietor = async (projectId: number, connection: IDBConnection): Promise<any> => {
  const sqlStatement = queries.dwc.getSurveyProprietorSQL(projectId);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL statement');
  }

  return connection.query(sqlStatement.text, sqlStatement.values);
};
