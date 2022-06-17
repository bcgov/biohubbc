import bbox from '@turf/bbox';
import circle from '@turf/circle';
import { AllGeoJSON, featureCollection } from '@turf/helpers';
import { coordEach } from '@turf/meta';
import jsonpatch from 'fast-json-patch';
import { v4 as uuidv4 } from 'uuid';
import xml2js from 'xml2js';
import { IDBConnection } from '../database/db';
import { IGetProject } from '../models/project-view';
import { SurveyObject } from '../models/survey-view';
import { getDbCharacterSystemMetaDataConstantSQL } from '../queries/codes/db-constant-queries';
import { queries } from '../queries/queries';
import { ProjectService } from './project-service';
import { DBService } from './service';
import { SurveyService } from './survey-service';
import { TaxonomyService } from './taxonomy-service';

const NOT_SUPPLIED_CONSTANT = 'Not Supplied';

const DEFAULT_DB_CONSTANTS = {
  EML_VERSION: '1.0.0',
  EML_PROVIDER_URL: NOT_SUPPLIED_CONSTANT,
  EML_SECURITY_PROVIDER_URL: NOT_SUPPLIED_CONSTANT,
  EML_ORGANIZATION_NAME: NOT_SUPPLIED_CONSTANT,
  EML_ORGANIZATION_URL: NOT_SUPPLIED_CONSTANT,
  EML_TAXONOMIC_PROVIDER_URL: NOT_SUPPLIED_CONSTANT,
  EML_INTELLECTUAL_RIGHTS: NOT_SUPPLIED_CONSTANT
};

type EMLDBConstants = {
  EML_VERSION: string;
  EML_PROVIDER_URL: string;
  EML_SECURITY_PROVIDER_URL: string;
  EML_ORGANIZATION_NAME: string;
  EML_ORGANIZATION_URL: string;
  EML_TAXONOMIC_PROVIDER_URL: string;
  EML_INTELLECTUAL_RIGHTS: string;
};

type Cache = {
  projectData?: IGetProject;
  surveyData?: SurveyObject[];
};

type BuildProjectEMLOptions = {
  /**
   * Whether or not to include typically non-public data in the EML. Defaults to `false`.
   *
   * @type {boolean}
   */
  includeSensitiveData?: boolean;
  /**
   * Specify which surveys to include in the EML. Defaults to undefined (all surveys).
   *
   * Usage:
   * - If left unset (undefined), all surveys will be included (default).
   * - If set to an array, then only those surveys will be included. An empty array indicates no surveys should be
   * included.
   *
   * @type {number[]}
   */
  surveyIds?: number[];
};

/**
 * Service to produce EML data for a project.
 *
 * @see https://eml.ecoinformatics.org for EML specification
 * @see https://knb.ecoinformatics.org/emlparser/ for an online EML validator.
 * @export
 * @class EmlService
 * @extends {DBService}
 */
export class EmlService extends DBService {
  private data: Record<string, unknown> = {};

  private projectId: number;
  private packageId: string;

  private surveyIds: number[] | undefined = undefined;

  private projectService: ProjectService;
  private surveyService: SurveyService;

  private cache: Cache = {};

  private constants: EMLDBConstants = DEFAULT_DB_CONSTANTS;

  private xml2jsBuilder: xml2js.Builder;

  private includeSensitiveData = false;

  constructor(options: { projectId: number; packageId?: string }, connection: IDBConnection) {
    super(connection);

    this.projectId = options.projectId;

    this.packageId = options.packageId || uuidv4();

    this.projectService = new ProjectService(this.connection);
    this.surveyService = new SurveyService(this.connection);

    this.xml2jsBuilder = new xml2js.Builder();
  }

  /**
   * Compiles and returns the project metadata as an Ecological Metadata Language (EML) compliant XML string.
   *
   * @param {BuildProjectEMLOptions} options
   * @return {*}
   * @memberof EmlService
   */
  async buildProjectEml(options: BuildProjectEMLOptions) {
    this.includeSensitiveData = options.includeSensitiveData || false;

    this.surveyIds = options.surveyIds;

    await this.loadProjectData();
    await this.loadSurveyData();
    await this.loadEMLDBConstants();

    this.buildEMLSection();
    this.buildAccessSection();
    await this.buildDatasetSection();
    await this.buildAdditionalMetadataSection();

    return this.xml2jsBuilder.buildObject(this.data);
  }

  private async loadEMLDBConstants() {
    const [
      organizationUrl,
      organizationName,
      providerURL,
      securityProviderURL,
      organizationURL,
      intellectualRights,
      taxonomicProviderURL
    ] = await Promise.all([
      this.connection.sql<{ constant: string }>(getDbCharacterSystemMetaDataConstantSQL('ORGANIZATION_URL')),
      this.connection.sql<{ constant: string }>(getDbCharacterSystemMetaDataConstantSQL('ORGANIZATION_NAME_FULL')),
      this.connection.sql<{ constant: string }>(getDbCharacterSystemMetaDataConstantSQL('PROVIDER_URL')),
      this.connection.sql<{ constant: string }>(getDbCharacterSystemMetaDataConstantSQL('SECURITY_PROVIDER_URL')),
      this.connection.sql<{ constant: string }>(getDbCharacterSystemMetaDataConstantSQL('ORGANIZATION_URL')),
      this.connection.sql<{ constant: string }>(getDbCharacterSystemMetaDataConstantSQL('INTELLECTUAL_RIGHTS')),
      this.connection.sql<{ constant: string }>(getDbCharacterSystemMetaDataConstantSQL('TAXONOMIC_PROVIDER_URL'))
    ]);

    this.constants.EML_ORGANIZATION_URL = organizationUrl.rows[0].constant || NOT_SUPPLIED_CONSTANT;
    this.constants.EML_ORGANIZATION_NAME = organizationName.rows[0].constant || NOT_SUPPLIED_CONSTANT;
    this.constants.EML_PROVIDER_URL = providerURL.rows[0].constant || NOT_SUPPLIED_CONSTANT;
    this.constants.EML_SECURITY_PROVIDER_URL = securityProviderURL.rows[0].constant || NOT_SUPPLIED_CONSTANT;
    this.constants.EML_ORGANIZATION_URL = organizationURL.rows[0].constant || NOT_SUPPLIED_CONSTANT;
    this.constants.EML_INTELLECTUAL_RIGHTS = intellectualRights.rows[0].constant || NOT_SUPPLIED_CONSTANT;
    this.constants.EML_TAXONOMIC_PROVIDER_URL = taxonomicProviderURL.rows[0].constant || NOT_SUPPLIED_CONSTANT;
  }

  private get projectData(): IGetProject {
    if (!this.cache.projectData) {
      throw Error('Project data was not loaded');
    }

    return this.cache.projectData;
  }

  private async loadProjectData() {
    const projectData = await this.projectService.getProjectById(this.projectId);

    this.cache.projectData = projectData;
  }

  private get surveyData(): SurveyObject[] {
    if (!this.cache.surveyData) {
      throw Error('Survey data was not loaded');
    }

    return this.cache.surveyData;
  }

  private async loadSurveyData() {
    const response = await this.surveyService.getSurveyIdsByProjectId(this.projectId);

    const allSurveyIds = response.map((item) => item.id);

    // if `BuildProjectEMLOptions.surveyIds` was provided then filter out any ids not in the list
    const includedSurveyIds = allSurveyIds.filter((item) => !this.surveyIds || this.surveyIds?.includes(item));

    const surveyData = await this.surveyService.getSurveysByIds(includedSurveyIds);

    this.cache.surveyData = surveyData;
  }

  private buildEMLSection() {
    jsonpatch.applyOperation(this.data, {
      op: 'add',
      path: '/eml:eml',
      value: {
        $: {
          packageId: `urn:uuid:${this.packageId}`,
          system: this.constants.EML_PROVIDER_URL,
          'xmlns:eml': 'https://eml.ecoinformatics.org/eml-2.2.0',
          'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
          'xmlns:stmml': 'http://www.xml-cml.org/schema/schema24',
          'xsi:schemaLocation': 'https://eml.ecoinformatics.org/eml-2.2.0 xsd/eml.xsd'
        }
      }
    });
  }

  private buildAccessSection() {
    jsonpatch.applyOperation(this.data, {
      op: 'add',
      path: '/eml:eml/access',
      value: {
        $: { authSystem: this.constants.EML_SECURITY_PROVIDER_URL, order: 'allowFirst' },
        allow: { principal: 'public', permission: 'read' }
      }
    });
  }

  private async buildDatasetSection(options?: { datasetTitle?: string }) {
    jsonpatch.applyOperation(this.data, {
      op: 'add',
      path: '/eml:eml/dataset',
      value: {
        $: { system: this.constants.EML_PROVIDER_URL, id: this.packageId },
        title: options?.datasetTitle || this.packageId,
        creator: this.getDatasetCreator(),
        ...(this.projectData.project.publish_date && { pubDate: this.projectData.project.publish_date }),
        metadataProvider: {
          organizationName: this.constants.EML_ORGANIZATION_NAME,
          onlineUrl: this.constants.EML_ORGANIZATION_URL
        },
        language: 'English',
        contact: this.getProjectContact(),
        project: {
          $: { id: this.projectData.project.uuid, system: this.constants.EML_PROVIDER_URL },
          title: this.projectData.project.project_name,
          personnel: this.getProjectPersonnel(),
          abstract: {
            section: [
              { title: 'Objectives', para: this.projectData.objectives.objectives },
              { title: 'Caveats', para: this.projectData.objectives.caveats || NOT_SUPPLIED_CONSTANT }
            ]
          },
          ...this.getProjectFundingSources(),
          studyAreaDescription: {
            // descriptor: {  // TODO required node? https://eml.ecoinformatics.org/schema/eml-project_xsd.html#ResearchProjectType_studyAreaDescription
            //   descriptorValue: ''
            // },
            coverage: {
              ...this.getGeographicCoverageEML(),
              temporalCoverage: this.getTemporalCoverageEML()
            }
          },
          relatedProject: await this.getSurveysEML()
        }
      }
    });
  }

  private async buildAdditionalMetadataSection() {
    const [firstNationsData, iucnClassificationDetailsData] = await Promise.all([
      this.connection.sql<{ name: string }>(queries.eml.getProjectFirstNationsSQL(this.projectId)),
      this.connection.sql<{ level_1_name: string; level_2_name: string; level_3_name: string }>(
        queries.eml.getIUCNClassificationsDetailsSQL(this.projectId)
      )
    ]);

    const data: { describes: any; metadata: any }[] = [];

    if (iucnClassificationDetailsData.rows?.length) {
      data.push({
        describes: this.packageId,
        metadata: {
          IUCNConservationActions: {
            IUCNConservationAction: iucnClassificationDetailsData.rows.map((item) => {
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

    if (this.projectData.partnerships.stakeholder_partnerships?.length) {
      data.push({
        describes: this.packageId,
        metadata: {
          stakeholderPartnerships: {
            stakeholderPartnership: this.projectData.partnerships.stakeholder_partnerships.map((item) => {
              return { name: item };
            })
          }
        }
      });
    }

    if (firstNationsData.rows?.length) {
      data.push({
        describes: this.packageId,
        metadata: {
          firstNationPartnerships: {
            firstNationPartnership: firstNationsData.rows.map((item) => {
              return { name: item.name };
            })
          }
        }
      });
    }

    if (this.includeSensitiveData) {
      if (this.projectData.permit.permits?.length) {
        // only include permits if sensitive data is enabled
        data.push({
          describes: this.packageId,
          metadata: {
            permits: {
              permit: this.projectData.permit.permits.map((item) => {
                return { permitType: item.permit_type, permitNumber: item.permit_number };
              })
            }
          }
        });
      }
    }

    jsonpatch.applyOperation(this.data, {
      op: 'add',
      path: '/eml:eml/additionalMetadata',
      value: data
    });
  }

  private getDatasetCreator(): Record<any, any> {
    const primaryContact = this.projectData.coordinator;

    if (JSON.parse(primaryContact.share_contact_details) || this.includeSensitiveData) {
      // return full details of the primary contact if it is public or sensitive data is enabled.
      return {
        organizationName: primaryContact.coordinator_agency,
        electronicMailAddress: primaryContact.email_address
      };
    }

    // return partial details of the primary contact
    return { organizationName: primaryContact.coordinator_agency };
  }

  /**
   * Get a primary contact for the project.
   *
   * @private
   * @return {*}  {Record<any, any>}
   * @memberof EmlService
   */
  private getProjectContact(): Record<any, any> {
    const primaryContact = this.projectData.coordinator;

    if (JSON.parse(primaryContact.share_contact_details) || this.includeSensitiveData) {
      // return full details of the primary contact if it is public or sensitive data is enabled.
      return {
        individualName: { givenName: primaryContact.first_name, surName: primaryContact.last_name },
        organizationName: primaryContact.coordinator_agency,
        electronicMailAddress: primaryContact.email_address
      };
    }

    // return partial details of the primary contact
    return { organizationName: primaryContact.coordinator_agency };
  }

  /**
   * Get all contacts for the project.
   *
   * @private
   * @return {*}  {Record<any, any>[]}
   * @memberof EmlService
   */
  private getProjectPersonnel(): Record<any, any>[] {
    const primaryContact = this.projectData.coordinator;

    if (JSON.parse(primaryContact.share_contact_details) || this.includeSensitiveData) {
      // return full details of the primary contact if it is public or sensitive data is enabled.
      return [
        {
          individualName: { givenName: primaryContact.first_name, surName: primaryContact.last_name },
          organizationName: primaryContact.coordinator_agency,
          electronicMailAddress: primaryContact.email_address,
          role: 'pointOfContact'
        }
      ];
    }

    // return partial details of the primary contact
    return [{ organizationName: primaryContact.coordinator_agency }];
  }

  private getProjectFundingSources(): Record<any, any> {
    if (!this.projectData.funding.fundingSources.length) {
      return {};
    }

    return {
      funding: {
        section: this.projectData.funding.fundingSources.map((item) => {
          return {
            title: 'Agency Name',
            para: item.agency_name,
            section: [
              { title: 'Funding Agency Project ID', para: item.agency_project_id },
              { title: 'Investment Action/Category', para: item.investment_action_category_name },
              { title: 'Funding Amount', para: item.funding_amount },
              { title: 'Funding Start Date', para: new Date(item.start_date).toISOString().split('T')[0] },
              { title: 'Funding End Date', para: new Date(item.end_date).toISOString().split('T')[0] }
            ]
          };
        })
      }
    };
  }

  private getSurveyFundingSources(surveyData: SurveyObject): Record<any, any> {
    if (!surveyData.funding.funding_sources.length) {
      return {};
    }

    return {
      funding: {
        section: surveyData.funding.funding_sources.map((item) => {
          return {
            title: 'Agency Name',
            para: item.agency_name,
            section: [
              { title: 'Funding Agency Project ID', para: item.funding_source_project_id },
              { title: 'Investment Action/Category', para: item.investment_action_category_name },
              { title: 'Funding Amount', para: item.funding_amount },
              { title: 'Funding Start Date', para: new Date(item.funding_start_date).toISOString().split('T')[0] },
              { title: 'Funding End Date', para: new Date(item.funding_end_date).toISOString().split('T')[0] }
            ]
          };
        })
      }
    };
  }

  private getTemporalCoverageEML(): Record<any, any> {
    if (!this.projectData.project.end_date) {
      // no end date
      return {
        singleDateTime: {
          calendarDate: this.projectData.project.start_date
        }
      };
    }

    return {
      rangeOfDates: {
        beginDate: { calendarDate: this.projectData.project.start_date },
        endDate: { calendarDate: this.projectData.project.end_date }
      }
    };
  }

  private getSurveyTemporalCoverageEML(surveyData: SurveyObject): Record<any, any> {
    if (!surveyData.survey_details.end_date) {
      // no end date
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

  private getGeographicCoverageEML(): Record<any, any> {
    if (!this.projectData.location.geometry) {
      return {};
    }

    const polygonFeatures = this.projectData.location.geometry?.map((item) => {
      if (item.geometry.type === 'Point' && item.properties?.radius) {
        return circle(item.geometry, item.properties.radius, { units: 'meters' });
      }

      return item;
    });

    const projectBoundingBox = bbox(featureCollection(polygonFeatures));

    const datasetGPolygons: Record<any, any>[] = [];

    polygonFeatures.forEach((feature) => {
      const featureCoords: number[][] = [];

      coordEach(feature as AllGeoJSON, (currentCoord) => {
        featureCoords.push(currentCoord);
      });

      datasetGPolygons.push({
        datasetGPolygonOuterGRing: [
          {
            gRingPoint: featureCoords.map((coords) => {
              return { gRingLatitude: coords[1], gRingLongitude: coords[0] };
            })
          }
        ]
      });
    });

    return {
      geographicCoverage: {
        geographicDescription: this.projectData.location.location_description || NOT_SUPPLIED_CONSTANT,
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

  private getSurveyGeographicCoverageEML(surveyData: SurveyObject): Record<any, any> {
    if (!surveyData.location.geometry?.length) {
      return {};
    }

    const polygonFeatures = surveyData.location.geometry?.map((item) => {
      if (item.geometry.type === 'Point' && item.properties?.radius) {
        return circle(item.geometry, item.properties.radius, { units: 'meters' });
      }

      return item;
    });

    const datasetGPolygons: Record<any, any>[] = [];

    polygonFeatures.forEach((feature) => {
      const featureCoords: number[][] = [];

      coordEach(feature as AllGeoJSON, (currentCoord) => {
        featureCoords.push(currentCoord);
      });

      datasetGPolygons.push({
        datasetGPolygonOuterGRing: [
          {
            gRingPoint: featureCoords.map((coords) => {
              return { gRingLatitude: coords[1], gRingLongitude: coords[0] };
            })
          }
        ]
      });
    });

    const projectBoundingBox = bbox(featureCollection(polygonFeatures));

    return {
      geographicCoverage: {
        geographicDescription: surveyData.location.survey_area_name,
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

  private async getSurveyFocalTaxonomicCoverage(surveyData: SurveyObject): Promise<Record<any, any>> {
    const taxonomySearchService = new TaxonomyService();

    const response = await taxonomySearchService.getTaxonomyFromIds(surveyData.species.focal_species);

    const taxonomicClassifications: Record<string, any>[] = [];

    response.forEach((item) => {
      const taxonRecord = item as Record<string, any>;

      taxonomicClassifications.push({
        taxonRankName: taxonRecord.tty_name,
        taxonRankValue: `${taxonRecord.unit_name1} ${taxonRecord.unit_name2} ${taxonRecord.unit_name3}`,
        commonName: taxonRecord.english_name,
        taxonId: { $: { provider: this.constants.EML_TAXONOMIC_PROVIDER_URL }, _: taxonRecord.code }
      });
    });

    return { taxonomicClassification: taxonomicClassifications };
  }

  private async getSurveysEML(): Promise<Record<any, any>[]> {
    const promises: Promise<Record<any, any>>[] = [];

    this.surveyData.forEach((item) => {
      promises.push(this.getSurveyEML(item));
    });

    return Promise.all(promises);
  }

  private async getSurveyEML(surveyData: SurveyObject): Promise<Record<any, any>> {
    return {
      $: { id: surveyData.survey_details.uuid, system: this.constants.EML_PROVIDER_URL },
      title: surveyData.survey_details.survey_name,
      personnel: this.getProjectPersonnel(),
      // abstract: {
      //   section: [
      //     { title: 'Objectives', para: this.projectData.objectives.objectives },
      //     ...((this.projectData.objectives.caveats && [
      //       { title: 'Caveats', para: this.projectData.objectives.caveats }
      //     ]) ||
      //       [])
      //   ]
      // },
      ...this.getSurveyFundingSources(surveyData),
      studyAreaDescription: {
        // descriptor: {  // TODO required node? https://eml.ecoinformatics.org/schema/eml-project_xsd.html#ResearchProjectType_studyAreaDescription
        //   descriptorValue: ''
        // },
        coverage: {
          ...this.getSurveyGeographicCoverageEML(surveyData),
          temporalCoverage: this.getSurveyTemporalCoverageEML(surveyData),
          taxonomicCoverage: await this.getSurveyFocalTaxonomicCoverage(surveyData)
        }
      }
    };
  }
}
