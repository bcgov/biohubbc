import { SearchHit } from '@elastic/elasticsearch/lib/api/types';
import bbox from '@turf/bbox';
import circle from '@turf/circle';
import { AllGeoJSON, featureCollection } from '@turf/helpers';
import { coordEach } from '@turf/meta';
import jsonpatch from 'fast-json-patch';
import { Feature, GeoJsonProperties, Geometry } from 'geojson';
import _ from 'lodash';
import SQL from 'sql-template-strings';
import xml2js from 'xml2js';
import { PROJECT_ROLE } from '../constants/roles';
import { IDBConnection } from '../database/db';
import { IGetProject } from '../models/project-view';
import { SurveyObject } from '../models/survey-view';
import { IAllCodeSets } from '../repositories/code-repository';
import { CodeService } from './code-service';
import { DBService } from './db-service';
import { ProjectService } from './project-service';
import { SurveyService } from './survey-service';
import { ITaxonomySource, TaxonomyService } from './taxonomy-service';

const NOT_SUPPLIED = 'Not Supplied';
const EMPTY_STRING = ``;

const DEFAULT_DB_CONSTANTS = {
  EML_VERSION: '1.0.0',
  EML_PROVIDER_URL: NOT_SUPPLIED,
  EML_SECURITY_PROVIDER_URL: NOT_SUPPLIED,
  EML_ORGANIZATION_NAME: NOT_SUPPLIED,
  EML_ORGANIZATION_URL: NOT_SUPPLIED,
  EML_TAXONOMIC_PROVIDER_URL: NOT_SUPPLIED,
  EML_INTELLECTUAL_RIGHTS: NOT_SUPPLIED
};

type EmlDbConstants = {
  EML_VERSION: string;
  EML_PROVIDER_URL: string;
  EML_SECURITY_PROVIDER_URL: string;
  EML_ORGANIZATION_NAME: string;
  EML_ORGANIZATION_URL: string;
  EML_TAXONOMIC_PROVIDER_URL: string;
  EML_INTELLECTUAL_RIGHTS: string;
};

type BuildProjectEmlOptions = {
  projectId: number;
};

type BuildSurveyEmlOptions = {
  surveyId: number;
};

type AdditionalMetadata = {
  describes: string;
  metadata: Record<string, any>;
};

type EmlPackageOptions = {
  packageId: string;
};

/**
 * Represents an EML package used to produce an EML string
 *
 * @class EmlPackage
 */
export class EmlPackage {
  /**
   * The unique identifier representing the EML package
   *
   * @type {string}
   * @memberof EmlPackage
   */
  packageId: string;

  /**
   * Maintains all EML package fields
   *
   * @type {Record<string, unknown>}
   * @memberof EmlPackage
   */
  _data: Record<string, unknown> = {};

  /**
   * Maintains EML field data for the EML package
   *
   * @type {(Record<string, any> | null)}
   * @memberof EmlPackage
   */
  _emlMetadata: Record<string, any> | null = null;

  /**
   * Maintains Dataset EML data for the EML package
   *
   * @type {(Record<string, any> | null)}
   * @memberof EmlPackage
   */
  _datasetMetadata: Record<string, any> | null = null;

  /**
   * Maintains Dataset Project EML data for the EML package
   *
   * @type {(Record<string, any> | null)}
   * @memberof EmlPackage
   */
  _projectMetadata: Record<string, any> | null = null;

  /**
   * Maintains Related Projects fields for the EML package
   *
   * @type {Record<string, any>[]}
   * @memberof EmlPackage
   */
  _relatedProjects: Record<string, any>[] = [];

  /**
   * Maintains Additional Metadata fields for the EML package
   *
   * @type {AdditionalMetadata[]}
   * @memberof EmlPackage
   */
  _additionalMetadata: AdditionalMetadata[] = [];

  /**
   * The XML2JS Builder which builds the EML string
   *
   * @type {xml2js.Builder}
   * @memberof EmlPackage
   */
  _xml2jsBuilder: xml2js.Builder;

  constructor(options: EmlPackageOptions) {
    this.packageId = options.packageId;

    this._xml2jsBuilder = new xml2js.Builder({ renderOpts: { pretty: false } });
  }

  /**
   * Sets the EML data field for the EML package
   *
   * @param {Record<string, any>} emlMetadata
   * @return {*}
   * @memberof EmlPackage
   */
  withEml(emlMetadata: Record<string, any>): EmlPackage {
    this._emlMetadata = emlMetadata;

    return this;
  }

  /**
   * Sets the Dataset data field for the EML package
   *
   * @param {Record<string, any>} datasetMetadata
   * @return {*}
   * @memberof EmlPackage
   */
  withDataset(datasetMetadata: Record<string, any>): EmlPackage {
    this._datasetMetadata = datasetMetadata;

    return this;
  }

  /**
   * Sets the Dataset Project data field for the EML package
   *
   * @param {Record<string, any>} projectMetadata
   * @return {*}
   * @memberof EmlPackage
   */
  withProject(projectMetadata: Record<string, any>): EmlPackage {
    this._projectMetadata = projectMetadata;

    return this;
  }

  /**
   * Appends Additional Metadata fields on the EML package
   *
   * @param {AdditionalMetadata[]} additionalMetadata
   * @return {*}
   * @memberof EmlPackage
   */
  withAdditionalMetadata(additionalMetadata: AdditionalMetadata[]): EmlPackage {
    additionalMetadata.forEach((meta) => this._additionalMetadata.push(meta));

    return this;
  }

  /**
   * Appends Related Project fields on the EML package
   *
   * @param {Record<string, any>[]} relatedProjects
   * @return {*}
   * @memberof EmlPackage
   */
  withRelatedProjects(relatedProjects: Record<string, any>[]): EmlPackage {
    relatedProjects.forEach((project) => this._relatedProjects.push(project));

    return this;
  }

  /**
   * Compiles the EML package
   *
   * @return {*}  {EmlPackage}
   * @memberof EmlPackage
   */
  build(): EmlPackage {
    if (this._data) {
      // Support subsequent compilations
      this._data = {};
    }

    // Add project metadata to dataset
    if (this._projectMetadata) {
      if (!this._datasetMetadata) {
        throw new Error("Can't build Project EML without first building dataset EML.");
      }

      this._datasetMetadata.project = this._projectMetadata;
    }

    // Add related projects metadata to project
    if (this._relatedProjects.length) {
      if (!this._datasetMetadata?.project) {
        throw new Error("Can't build Project EML without first building Dataset Project EML.");
      } else if (!this._datasetMetadata) {
        throw new Error("Can't build Related Project EML without first building dataset EML.");
      }

      this._datasetMetadata.project.relatedProject = this._relatedProjects;
    }

    jsonpatch.applyOperation(this._data, {
      op: 'add',
      path: '/eml:eml',
      value: this._emlMetadata
    });

    jsonpatch.applyOperation(this._data, {
      op: 'add',
      path: '/eml:eml/dataset',
      value: this._datasetMetadata
    });

    jsonpatch.applyOperation(this._data, {
      op: 'add',
      path: '/eml:eml/additionalMetadata',
      value: this._additionalMetadata
    });

    return this;
  }

  /**
   * Returns the EML package as an EML-compliant XML string.
   *
   * @return {*}  {string}
   * @memberof EmlPackage
   */
  toString(): string {
    return this._xml2jsBuilder.buildObject(this._data);
  }

  /**
   * Returns the EML as a JSON object
   *
   * @return {*}  {Record<string, any>}
   * @memberof EmlPackage
   */
  toJson(): Record<string, any> {
    return this._data;
  }
}

/**
 * Service to produce Ecological Metadata Language (EML) data for projects and surveys.
 *
 * @see https://eml.ecoinformatics.org for EML specification
 * @see https://knb.ecoinformatics.org/emlparser/ for an online EML validator.
 * @export
 * @class EmlService
 * @extends {DBService}
 */
export class EmlService extends DBService {
  _projectService: ProjectService;
  _surveyService: SurveyService;
  _codeService: CodeService;

  _constants: EmlDbConstants = DEFAULT_DB_CONSTANTS;

  _codes: IAllCodeSets | null;

  constructor(connection: IDBConnection) {
    super(connection);

    this._projectService = new ProjectService(this.connection);
    this._surveyService = new SurveyService(this.connection);
    this._codeService = new CodeService(this.connection);
    this._codes = null;
  }

  /**
   * Produces an EML package representing the project with the given project ID
   *
   * @param {BuildProjectEmlOptions} options
   * @return {*}  {Promise<EmlString>}
   * @memberof EmlService
   */
  async buildProjectEmlPackage(options: BuildProjectEmlOptions): Promise<EmlPackage> {
    const { projectId } = options;
    await this.loadEmlDbConstants();

    const projectData = await this._projectService.getProjectById(projectId);
    const packageId = projectData.project.uuid;

    const surveysData = await this._surveyService.getSurveysByProjectId(projectId);

    const emlPackage = new EmlPackage({ packageId });

    return (
      emlPackage
        // Build EML field
        .withEml(this._buildEmlSection(packageId))

        // Build EML->Dataset field
        .withDataset(this._buildProjectEmlDatasetSection(packageId, projectData))

        // Build EML->Dataset->Project field
        .withProject(this._buildProjectEmlProjectSection(projectData))

        // Build EML->Dataset->Project->AdditionalMetadata field
        .withAdditionalMetadata(await this._getProjectAdditionalMetadata(projectData))
        .withAdditionalMetadata(await this._getSurveyAdditionalMetadata(surveysData))

        // Build EML->Dataset->Project->RelatedProject field
        .withRelatedProjects(await this._buildAllSurveyEmlProjectSections(surveysData))

        // Compile the EML package
        .build()
    );
  }

  /**
   * Produces an EML package representing the survey with the given survey ID
   *
   * @param {BuildSurveyEmlOptions} options
   * @return {*}  {Promise<EmlString>}
   * @memberof EmlService
   */
  async buildSurveyEmlPackage(options: BuildSurveyEmlOptions): Promise<EmlPackage> {
    const { surveyId } = options;
    await this.loadEmlDbConstants();

    const surveyData = await this._surveyService.getSurveyById(surveyId);

    const packageId = surveyData.survey_details.uuid;

    const projectId = surveyData.survey_details.project_id;
    const projectData = await this._projectService.getProjectById(projectId);

    const emlPackage = new EmlPackage({ packageId });

    return (
      emlPackage
        // Build EML field
        .withEml(this._buildEmlSection(packageId))

        // Build EML->Dataset field
        .withDataset(this._buildSurveyEmlDatasetSection(packageId, surveyData))

        // Build EML->Dataset->Project field
        .withProject(await this._buildSurveyEmlProjectSection(surveyData))

        // Build EML->Dataset->Project->AdditionalMetadata field
        .withAdditionalMetadata(await this._getProjectAdditionalMetadata(projectData))
        .withAdditionalMetadata(await this._getSurveyAdditionalMetadata([surveyData]))

        // Build EML->Dataset->Project->RelatedProject field//
        .withRelatedProjects([this._buildProjectEmlProjectSection(projectData)])

        // Compile the EML package
        .build()
    );
  }

  /**
   * Loads all codesets.
   *
   * @return {*}  {Promise<IAllCodeSets>}
   * @memberof EmlService
   */
  async codes(): Promise<IAllCodeSets> {
    if (!this._codes) {
      this._codes = await this._codeService.getAllCodeSets();
    }

    return this._codes;
  }

  /**
   * Loads constants pertaining to EML generation from the database.
   */
  async loadEmlDbConstants() {
    const [
      organizationUrl,
      organizationName,
      providerURL,
      securityProviderURL,
      intellectualRights,
      taxonomicProviderURL
    ] = await Promise.all([
      this.connection.sql<{ constant: string }>(
        SQL`SELECT api_get_character_system_metadata_constant(${'ORGANIZATION_URL'}) as constant;`
      ),
      this.connection.sql<{ constant: string }>(
        SQL`SELECT api_get_character_system_metadata_constant(${'ORGANIZATION_NAME_FULL'}) as constant;`
      ),
      this.connection.sql<{ constant: string }>(
        SQL`SELECT api_get_character_system_metadata_constant(${'PROVIDER_URL'}) as constant;`
      ),
      this.connection.sql<{ constant: string }>(
        SQL`SELECT api_get_character_system_metadata_constant(${'SECURITY_PROVIDER_URL'}) as constant;`
      ),
      this.connection.sql<{ constant: string }>(
        SQL`SELECT api_get_character_system_metadata_constant(${'INTELLECTUAL_RIGHTS'}) as constant;`
      ),
      this.connection.sql<{ constant: string }>(
        SQL`SELECT api_get_character_system_metadata_constant(${'TAXONOMIC_PROVIDER_URL'}) as constant;`
      )
    ]);

    this._constants.EML_ORGANIZATION_URL = organizationUrl.rows[0]?.constant || NOT_SUPPLIED;
    this._constants.EML_ORGANIZATION_NAME = organizationName.rows[0]?.constant || NOT_SUPPLIED;
    this._constants.EML_PROVIDER_URL = providerURL.rows[0]?.constant || NOT_SUPPLIED;
    this._constants.EML_SECURITY_PROVIDER_URL = securityProviderURL.rows[0]?.constant || NOT_SUPPLIED;
    this._constants.EML_INTELLECTUAL_RIGHTS = intellectualRights.rows[0]?.constant || NOT_SUPPLIED;
    this._constants.EML_TAXONOMIC_PROVIDER_URL = taxonomicProviderURL.rows[0]?.constant || NOT_SUPPLIED;
  }

  /**
   * Builds the EML section of an EML package for either a project or survey
   *
   * @param {string} packageId
   * @return {*}  {Record<string, any>}
   * @memberof EmlService
   */
  _buildEmlSection(packageId: string): Record<string, any> {
    return {
      $: {
        packageId: `urn:uuid:${packageId}`,
        system: EMPTY_STRING,
        'xmlns:eml': 'https://eml.ecoinformatics.org/eml-2.2.0',
        'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
        'xmlns:stmml': 'http://www.xml-cml.org/schema/schema24',
        'xsi:schemaLocation': 'https://eml.ecoinformatics.org/eml-2.2.0 xsd/eml.xsd'
      }
    };
  }

  /**
   * Builds the EML Dataset section for a project
   *
   * @param {IGetProject} projectData
   * @param {string} packageId
   * @return {*}  {Promise<Record<string, any>>}
   * @memberof EmlService
   */
  _buildProjectEmlDatasetSection(packageId: string, projectData: IGetProject): Record<string, any> {
    return {
      $: { system: EMPTY_STRING, id: packageId },
      title: projectData.project.project_name,
      creator: this._getProjectDatasetCreator(projectData),

      // EML specification expects short ISO format
      pubDate: this._makeEmlDateString(),
      language: 'English',
      contact: this._getProjectContact(projectData)
    };
  }

  /**
   * Builds the EML Dataset section for a survey
   *
   * @param {string} packageId
   * @param {SurveyObject} surveyData
   * @return {*}  {Record<string, any>}
   * @memberof EmlService
   */
  _buildSurveyEmlDatasetSection(packageId: string, surveyData: SurveyObject): Record<string, any> {
    return {
      $: { system: EMPTY_STRING, id: packageId },
      title: surveyData.survey_details.survey_name,
      creator: this._getSurveyContact(surveyData),

      // EML specification expects short ISO format
      pubDate: this._makeEmlDateString(),
      language: 'English',
      contact: this._getSurveyContact(surveyData)
    };
  }

  /**
   * Builds the EML Project section for the given project data
   *
   * @param {IGetProject} projectData
   * @return {*}  {Record<string, any>}
   * @memberof EmlService
   */
  _buildProjectEmlProjectSection(projectData: IGetProject): Record<string, any> {
    return {
      $: { id: projectData.project.uuid, system: EMPTY_STRING },
      title: projectData.project.project_name,
      personnel: this._getProjectPersonnel(projectData),
      abstract: {
        section: [{ title: 'Objectives', para: projectData.objectives.objectives }]
      },
      studyAreaDescription: {
        coverage: {
          ...this._getProjectGeographicCoverage(projectData),
          temporalCoverage: this._getProjectTemporalCoverage(projectData)
        }
      }
    };
  }

  /**
   * Generates additional metadata fields for the given array of surveys
   *
   * @param {SurveyObjectWithAttachments[]} _surveysData
   * @return {*}  {AdditionalMetadata[]}
   * @memberof EmlService
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async _getSurveyAdditionalMetadata(_surveysData: SurveyObject[]): Promise<AdditionalMetadata[]> {
    const additionalMetadata: AdditionalMetadata[] = [];
    const codes = await this.codes();

    await Promise.all(
      _surveysData.map(async (item) => {
        // add this metadata field so biohub is aware if EML is a project or survey
        additionalMetadata.push({
          describes: item.survey_details.uuid,
          metadata: {
            types: {
              type: 'SURVEY'
            }
          }
        });

        const partnetshipsMetadata = await this._buildPartnershipMetadata(item);
        additionalMetadata.push(partnetshipsMetadata);

        if (item.survey_details.survey_types.length) {
          const names = codes.type
            .filter((code) => item.survey_details.survey_types.includes(code.id))
            .map((code) => code.name);

          additionalMetadata.push({
            describes: item.survey_details.uuid,
            metadata: {
              surveyTypes: {
                surveyType: names.map((item) => {
                  return { name: item };
                })
              }
            }
          });
        }
      })
    );

    return additionalMetadata;
  }

  /**
   * Generates additional metadata fields for the given project
   *
   * @param {IGetProject} projectData
   * @return {*}  {Promise<AdditionalMetadata[]>}
   * @memberof EmlService
   */
  async _getProjectAdditionalMetadata(projectData: IGetProject): Promise<AdditionalMetadata[]> {
    const additionalMetadata: AdditionalMetadata[] = [];
    const codes = await this.codes();

    if (projectData.project.project_programs) {
      additionalMetadata.push({
        describes: projectData.project.uuid,
        metadata: {
          projectPrograms: {
            projectProgram: projectData.project.project_programs.map(
              (item) => codes.program.find((code) => code.id === item)?.name
            )
          }
        }
      });
    }

    if (projectData.iucn.classificationDetails.length) {
      const iucnNames = projectData.iucn.classificationDetails.map((iucnItem) => {
        return {
          level_1_name: codes.iucn_conservation_action_level_1_classification.find(
            (code) => iucnItem.classification === code.id
          )?.name,
          level_2_name: codes.iucn_conservation_action_level_2_subclassification.find(
            (code) => iucnItem.subClassification1 === code.id
          )?.name,
          level_3_name: codes.iucn_conservation_action_level_3_subclassification.find(
            (code) => iucnItem.subClassification2 === code.id
          )?.name
        };
      });

      additionalMetadata.push({
        describes: projectData.project.uuid,
        metadata: {
          IUCNConservationActions: {
            IUCNConservationAction: iucnNames.map((item) => {
              return {
                IUCNConservationActionLevel1Classification: item.level_1_name,
                IUCNConservationActionLevel2SubClassification: item.level_2_name,
                IUCNConservationActionLevel3SubClassification: item.level_3_name
              };
            })
          }
        }
      });
    }

    // add this metadata field so biohub is aware if EML is a project or survey
    additionalMetadata.push({
      describes: projectData.project.uuid,
      metadata: {
        types: {
          type: 'PROJECT'
        }
      }
    });

    return additionalMetadata;
  }

  async _buildPartnershipMetadata(surveyData: SurveyObject): Promise<any> {
    const stakeholders = surveyData.partnerships.stakeholder_partnerships;
    const codes = await this.codes();
    const indigenousPartnerships = surveyData.partnerships.indigenous_partnerships;
    const firstNationsNames = codes.first_nations
      .filter((code) => indigenousPartnerships.includes(code.id))
      .map((code) => code.name);

    const sortedPartnerships = _.sortBy([...firstNationsNames, ...stakeholders]);

    return {
      describes: surveyData.survey_details.uuid,
      metadata: {
        partnerships: {
          partnership: sortedPartnerships.map((name) => {
            return { name };
          })
        }
      }
    };
  }

  /**
   * Creates an object representing the dataset creator from the given projectData.
   *
   *
   * @param {IGetProject} projectData
   * @return {*}  {Record<string, any>}
   * @memberof EmlService
   */
  _getProjectDatasetCreator(projectData: IGetProject): Record<string, any> {
    const coordinator = projectData.participants.find((participant) => {
      return participant.role_names.includes(PROJECT_ROLE.COORDINATOR);
    });

    if (!coordinator) {
      // Return default organization name
      return { organizationName: this._constants.EML_ORGANIZATION_NAME };
    }

    return {
      individualName: { givenName: coordinator.given_name, surName: coordinator.family_name },
      electronicMailAddress: coordinator.email
    };
  }

  /**
   * Creates an object representing the primary contact for the given project.
   *
   *
   * @param {IGetProject} projectData
   * @return {*}  {Record<string, any>}
   * @memberof EmlService
   */
  _getProjectContact(projectData: IGetProject): Record<string, any> {
    const coordinator = projectData.participants.find((participant) => {
      return participant.role_names.includes(PROJECT_ROLE.COORDINATOR);
    });

    if (!coordinator) {
      // Return default organization name
      return { organizationName: this._constants.EML_ORGANIZATION_NAME };
    }

    return {
      individualName: { givenName: coordinator.given_name, surName: coordinator.family_name },
      electronicMailAddress: coordinator.email,
      role: 'pointOfContact'
    };
  }

  /**
   * Creates an object representing the biologist name for the given survey.
   *
   * @param {SurveyObject} surveyData
   * @return {*}  {Record<string, any>}
   * @memberof EmlService
   */
  _getSurveyContact(surveyData: SurveyObject): Record<string, any> {
    const coordinator = surveyData.participants.find((participant) => {
      return participant.role_names.includes(PROJECT_ROLE.COORDINATOR);
    });

    if (!coordinator) {
      // Return default organization name
      return { organizationName: this._constants.EML_ORGANIZATION_NAME };
    }

    return {
      individualName: { givenName: coordinator.given_name, surName: coordinator.family_name },
      electronicMailAddress: coordinator.email,
      role: 'pointOfContact'
    };
  }

  /**
   * Creates an object representing all contacts for the given project.
   *
   *
   * @param {IGetProject} projectData
   * @return {*}  {Record<string, any>[]}
   * @memberof EmlService
   */
  _getProjectPersonnel(projectData: IGetProject): Record<string, any>[] {
    const participants = projectData.participants;

    return participants.map((participant) => ({
      individualName: { givenName: participant.given_name, surName: participant.family_name },
      electronicMailAddress: participant.email
    }));
  }

  /**
   * Creates an object representing all contacts for the given survey.
   *
   * @param {SurveyObject} surveyData
   * @return {*}  {Record<string, any>[]}
   * @memberof EmlService
   */
  _getSurveyPersonnel(surveyData: SurveyObject): Record<string, any>[] {
    const participants = surveyData.participants;

    return participants.map((participant) => ({
      individualName: { givenName: participant.given_name, surName: participant.family_name },
      electronicMailAddress: participant.email
    }));
  }

  /**
   * Creates an object representing temporal coverage for the given project
   *
   * @param {IGetProject} projectData
   * @return {*}  {Record<string, any>}
   * @memberof EmlService
   */
  _getProjectTemporalCoverage(projectData: IGetProject): Record<string, any> {
    if (!projectData.project.end_date) {
      return {
        singleDateTime: {
          calendarDate: projectData.project.start_date
        }
      };
    }

    return {
      rangeOfDates: {
        beginDate: { calendarDate: projectData.project.start_date },
        endDate: { calendarDate: projectData.project.end_date }
      }
    };
  }

  /**
   * Creates an object representing temporal coverage for the given survey
   *
   * @param {SurveyObject} surveyData
   * @return {*}  {Record<string, any>}
   * @memberof EmlService
   */
  _getSurveyTemporalCoverage(surveyData: SurveyObject): Record<string, any> {
    if (!surveyData.survey_details.end_date) {
      return {
        singleDateTime: {
          calendarDate: surveyData.survey_details.start_date
        }
      };
    }

    return {
      rangeOfDates: {
        beginDate: { calendarDate: surveyData.survey_details.start_date },
        endDate: { calendarDate: surveyData.survey_details.end_date }
      }
    };
  }

  /**
   * Converts a Date or string into a date string compatible with EML.
   *
   * @param {Date | string} [date]
   * @return {*}  {string}
   * @memberof EmlService
   */
  _makeEmlDateString(date?: Date | string): string {
    return (date ? new Date(date) : new Date()).toISOString().split('T')[0];
  }

  /**
   * Creates an array of polygon features for the given project or survey geometry.
   *
   * @param {Feature<Geometry, GeoJsonProperties>[]} geometry
   * @return {*}  {Feature<Geometry, GeoJsonProperties>[]}
   * @memberof EmlService
   */
  _makePolygonFeatures(geometry: Feature<Geometry, GeoJsonProperties>[]): Feature<Geometry, GeoJsonProperties>[] {
    return geometry.map((feature) => {
      if (feature.geometry.type === 'Point' && feature.properties?.radius) {
        return circle(feature.geometry, feature.properties.radius, { units: 'meters' });
      }

      return feature;
    });
  }

  /**
   * Creates a set of datasetGPoloygons for the given project or survey
   *
   * @param {Feature<Geometry, GeoJsonProperties>[]} polygonFeatures
   * @return {*}  {Record<string, any>[]}
   * @memberof EmlService
   */
  _makeDatasetGPolygons(polygonFeatures: Feature<Geometry, GeoJsonProperties>[]): Record<string, any>[] {
    return polygonFeatures.map((feature) => {
      const featureCoords: number[][] = [];

      coordEach(feature as AllGeoJSON, (currentCoord) => {
        featureCoords.push(currentCoord);
      });

      return {
        datasetGPolygonOuterGRing: [
          {
            gRingPoint: featureCoords.map((coords) => {
              return { gRingLatitude: coords[1], gRingLongitude: coords[0] };
            })
          }
        ]
      };
    });
  }

  /**
   * Creates an object representing geographic coverage pertaining to the given project
   *
   * @param {IGetProject} projectData
   * @return {*}  {Record<string, any>}
   * @memberof EmlService
   */
  _getProjectGeographicCoverage(projectData: IGetProject): Record<string, any> {
    if (!projectData.location.geometry) {
      return {};
    }

    const polygonFeatures = this._makePolygonFeatures(projectData.location.geometry);
    const datasetGPolygons = this._makeDatasetGPolygons(polygonFeatures);
    const projectBoundingBox = bbox(featureCollection(polygonFeatures));

    return {
      geographicCoverage: {
        geographicDescription: projectData.location.location_description || NOT_SUPPLIED,
        boundingCoordinates: {
          westBoundingCoordinate: projectBoundingBox[0],
          eastBoundingCoordinate: projectBoundingBox[2],
          northBoundingCoordinate: projectBoundingBox[3],
          southBoundingCoordinate: projectBoundingBox[1]
        },
        datasetGPolygon: datasetGPolygons
      }
    };
  }

  /**
   * Creates an object representing geographic coverage pertaining to the given survey
   *
   * @param {SurveyObject} surveyData
   * @return {*}  {Record<string, any>}
   * @memberof EmlService
   */
  _getSurveyGeographicCoverage(surveyData: SurveyObject): Record<string, any> {
    if (!surveyData.locations[0]?.geometry?.length) {
      return {};
    }

    const polygonFeatures = this._makePolygonFeatures(
      surveyData.locations[0].geometry as Feature<Geometry, GeoJsonProperties>[]
    );
    const datasetGPolygons = this._makeDatasetGPolygons(polygonFeatures);
    const surveyBoundingBox = bbox(featureCollection(polygonFeatures));

    return {
      geographicCoverage: {
        geographicDescription: surveyData.locations[0].name,
        boundingCoordinates: {
          westBoundingCoordinate: surveyBoundingBox[0],
          eastBoundingCoordinate: surveyBoundingBox[2],
          northBoundingCoordinate: surveyBoundingBox[3],
          southBoundingCoordinate: surveyBoundingBox[1]
        },
        datasetGPolygon: datasetGPolygons
      }
    };
  }

  /**
   * Retrieves taxonomic coverage details for the given survey's focal species.
   *
   * @param {SurveyObject} surveyData
   * @return {*}  {Promise<Record<string, any>>}
   * @memberof EmlService
   */
  async _getSurveyFocalTaxonomicCoverage(surveyData: SurveyObject): Promise<Record<string, any>> {
    const taxonomySearchService = new TaxonomyService();

    const response = await taxonomySearchService.getTaxonomyFromIds(surveyData.species.focal_species);

    const taxonomicClassification: Record<string, any>[] = [];

    response.forEach((taxonResult: SearchHit<ITaxonomySource>) => {
      const { _source } = taxonResult;

      if (_source) {
        taxonomicClassification.push({
          taxonRankName: _source.tty_name,
          taxonRankValue: [_source.unit_name1, _source.unit_name2, _source.unit_name3].filter(Boolean).join(' '),
          commonName: _source.english_name,
          taxonId: {
            $: { provider: EMPTY_STRING },
            _: taxonResult._id
          }
        });
      }
    });

    return { taxonomicClassification };
  }

  /**
   * Creates an object representing the design description for the given survey
   *
   * @param {SurveyObject} surveyData
   * @return {*}  {Promise<Record<string, any>>}
   * @memberof EmlService
   */
  async _getSurveyDesignDescription(survey: SurveyObject): Promise<Record<string, any>> {
    const codes = await this.codes();

    return {
      description: {
        section: [
          {
            title: 'Field Method',
            para: codes.field_methods.find((code) => code.id === survey.purpose_and_methodology.field_method_id)?.name
          },
          {
            title: 'Vantage Codes',
            para: {
              itemizedlist: {
                listitem: codes.vantage_codes
                  .filter((code) => survey.purpose_and_methodology.vantage_code_ids.includes(code.id))
                  .map((code) => {
                    return { para: code.name };
                  })
              }
            }
          }
        ]
      }
    };
  }

  /**
   * Builds the EML Project section for the given array of surveys
   *
   * @param {SurveyObjectWithAttachments[]} surveys
   * @return {*}  {Promise<Record<string, any>[]>}
   * @memberof EmlService
   */
  async _buildAllSurveyEmlProjectSections(surveysData: SurveyObject[]): Promise<Record<string, any>[]> {
    return Promise.all(surveysData.map(async (survey) => await this._buildSurveyEmlProjectSection(survey)));
  }

  /**
   * Builds the EML Project section for the given survey
   *
   * @param {SurveyObject} surveyData
   * @return {*}  {Promise<Record<string, any>>}
   * @memberof EmlService
   */
  async _buildSurveyEmlProjectSection(surveyData: SurveyObject): Promise<Record<string, any>> {
    const codes = await this.codes();

    return {
      $: { id: surveyData.survey_details.uuid, system: EMPTY_STRING },
      title: surveyData.survey_details.survey_name,
      personnel: this._getSurveyPersonnel(surveyData),
      abstract: {
        section: [
          {
            title: 'Intended Outcomes',
            para: surveyData.purpose_and_methodology.intended_outcome_ids
              .map((outcomeId) => codes.intended_outcomes.find((code) => code.id === outcomeId)?.name)
              .join(', ')
          },
          {
            title: 'Additional Details',
            para: surveyData.purpose_and_methodology.additional_details || NOT_SUPPLIED
          }
        ]
      },
      studyAreaDescription: {
        coverage: {
          ...this._getSurveyGeographicCoverage(surveyData),
          temporalCoverage: this._getSurveyTemporalCoverage(surveyData),
          taxonomicCoverage: await this._getSurveyFocalTaxonomicCoverage(surveyData)
        }
      },
      designDescription: await this._getSurveyDesignDescription(surveyData)
    };
  }
}
