import bbox from '@turf/bbox';
import circle from '@turf/circle';
import { AllGeoJSON, featureCollection } from '@turf/helpers';
import { coordEach } from '@turf/meta';
import jsonpatch from 'fast-json-patch';
import xml2js from 'xml2js';
import { IDBConnection } from '../database/db';
import {
  GetAttachmentsData as GetProjectAttachmentsData,
  GetReportAttachmentsData as GetProjectReportAttachmentsData,
  IGetProject
} from '../models/project-view';
import {
  GetAttachmentsData as GetSurveyAttachmentsData,
  GetReportAttachmentsData as GetSurveyReportAttachmentsData,
  SurveyObject
} from '../models/survey-view';
import { getDbCharacterSystemMetaDataConstantSQL } from '../queries/codes/db-constant-queries';
import { CodeService, IAllCodeSets } from './code-service';
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

type SurveyObjectWithAttachments = SurveyObject & {
  attachments?: GetSurveyAttachmentsData;
  report_attachments?: GetSurveyReportAttachmentsData;
};

type Cache = {
  projectData?: IGetProject;
  surveyData?: SurveyObjectWithAttachments[];
  projectAttachmentData?: GetProjectAttachmentsData;
  projectReportAttachmentData?: GetProjectReportAttachmentsData;
  codes?: IAllCodeSets;
};

export type BuildProjectEMLOptions = {
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
  data: Record<string, unknown> = {};

  _packageId: string | undefined;

  projectId: number;
  surveyIds: number[] | undefined = undefined;

  projectService: ProjectService;
  surveyService: SurveyService;
  codeService: CodeService;

  cache: Cache = {};

  constants: EMLDBConstants = DEFAULT_DB_CONSTANTS;

  xml2jsBuilder: xml2js.Builder;

  includeSensitiveData = false;

  constructor(options: { projectId: number; packageId?: string }, connection: IDBConnection) {
    super(connection);

    this._packageId = options.packageId;

    this.projectId = options.projectId;

    this.projectService = new ProjectService(this.connection);
    this.surveyService = new SurveyService(this.connection);
    this.codeService = new CodeService(this.connection);

    this.xml2jsBuilder = new xml2js.Builder({ renderOpts: { pretty: false } });
  }

  /**
   * Compiles and returns the project metadata as an Ecological Metadata Language (EML) compliant XML string.
   *
   * @param {BuildProjectEMLOptions} [options]
   * @return {*}  {Promise<string>}
   * @memberof EmlService
   */
  async buildProjectEml(options?: BuildProjectEMLOptions): Promise<string> {
    this.includeSensitiveData = options?.includeSensitiveData || false;

    this.surveyIds = options?.surveyIds || [];

    await this.loadProjectData();
    await this.loadSurveyData();
    await this.loadEMLDBConstants();
    await this.loadCodes();

    this.buildEMLSection();
    this.buildAccessSection();
    await this.buildDatasetSection();
    await this.buildAdditionalMetadataSection();

    return this.xml2jsBuilder.buildObject(this.data);
  }

  async loadEMLDBConstants() {
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

  get packageId(): string {
    if (!this._packageId) {
      return this.projectData.project.uuid;
    }

    return this._packageId;
  }

  get codes(): IAllCodeSets {
    if (!this.cache.codes) {
      throw Error('Codes data was not loaded');
    }

    return this.cache.codes;
  }

  async loadCodes() {
    const allCodeSets = await this.codeService.getAllCodeSets();

    this.cache.codes = allCodeSets;
  }

  get projectData(): IGetProject {
    if (!this.cache.projectData) {
      throw Error('Project data was not loaded');
    }

    return this.cache.projectData;
  }

  get projectAttachmentData(): GetProjectAttachmentsData | undefined {
    return this.cache.projectAttachmentData;
  }

  get projectReportAttachmentData(): GetProjectReportAttachmentsData | undefined {
    return this.cache.projectReportAttachmentData;
  }

  async loadProjectData() {
    const projectData = await this.projectService.getProjectById(this.projectId);
    const attachmentData = await this.projectService.getAttachmentsData(this.projectId);
    const attachmentReportData = await this.projectService.getReportAttachmentsData(this.projectId);

    this.cache.projectData = projectData;
    this.cache.projectAttachmentData = attachmentData;
    this.cache.projectReportAttachmentData = attachmentReportData;
  }

  get surveyData(): SurveyObjectWithAttachments[] {
    if (!this.cache.surveyData) {
      throw Error('Survey data was not loaded');
    }

    return this.cache.surveyData;
  }

  async loadSurveyData() {
    const response = await this.surveyService.getSurveyIdsByProjectId(this.projectId);

    const allSurveyIds = response.map((item) => item.id);

    // if `BuildProjectEMLOptions.surveyIds` was provided then filter out any ids not in the list
    const includedSurveyIds = allSurveyIds.filter((item) => !this.surveyIds?.length || this.surveyIds?.includes(item));

    const surveyData = await this.surveyService.getSurveysByIds(includedSurveyIds);

    this.cache.surveyData = surveyData;

    this.cache.surveyData.forEach(
      async (item) => (item.attachments = await this.surveyService.getAttachmentsData(item.survey_details.id))
    );
    this.cache.surveyData.forEach(
      async (item) =>
        (item.report_attachments = await this.surveyService.getReportAttachmentsData(item.survey_details.id))
    );
  }

  buildEMLSection() {
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

  buildAccessSection() {
    jsonpatch.applyOperation(this.data, {
      op: 'add',
      path: '/eml:eml/access',
      value: {
        $: { authSystem: this.constants.EML_SECURITY_PROVIDER_URL, order: 'allowFirst' },
        allow: { principal: 'public', permission: 'read' }
      }
    });
  }

  async buildDatasetSection(options?: { datasetTitle?: string }) {
    jsonpatch.applyOperation(this.data, {
      op: 'add',
      path: '/eml:eml/dataset',
      value: {
        $: { system: this.constants.EML_PROVIDER_URL, id: this.packageId },
        title: options?.datasetTitle || this.projectData.project.project_name,
        creator: this.getDatasetCreator(),
        metadataProvider: {
          organizationName: this.constants.EML_ORGANIZATION_NAME,
          onlineUrl: this.constants.EML_ORGANIZATION_URL
        },
        //EML specification expects short ISO format
        pubDate: new Date().toISOString().substring(0, 10),
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

  async buildAdditionalMetadataSection() {
    const data: { describes: any; metadata: any }[] = [];

    if (this.projectData.project.project_type) {
      data.push({
        describes: this.projectData.project.uuid,
        metadata: {
          projectTypes: {
            projectType: this.codes.project_type.find((code) => this.projectData.project.project_type === code.id)?.name
          }
        }
      });
    }

    if (this.projectData.project.project_activities.length) {
      const names = this.codes.activity
        .filter((item) => this.projectData.project.project_activities.includes(item.id))
        .map((item) => item.name);

      data.push({
        describes: this.projectData.project.uuid,
        metadata: {
          projectActivities: {
            projectActivity: names.map((item) => {
              return { name: item };
            })
          }
        }
      });
    }

    if (this.projectData.iucn.classificationDetails.length) {
      const iucnNames = this.projectData.iucn.classificationDetails.map((iucnItem) => {
        return {
          level_1_name: this.codes.iucn_conservation_action_level_1_classification.find(
            (code) => iucnItem.classification === code.id
          )?.name,
          level_2_name: this.codes.iucn_conservation_action_level_2_subclassification.find(
            (code) => iucnItem.subClassification1 === code.id
          )?.name,
          level_3_name: this.codes.iucn_conservation_action_level_3_subclassification.find(
            (code) => iucnItem.subClassification2 === code.id
          )?.name
        };
      });

      data.push({
        describes: this.projectData.project.uuid,
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

    if (this.projectData.partnerships.stakeholder_partnerships?.length) {
      data.push({
        describes: this.projectData.project.uuid,
        metadata: {
          stakeholderPartnerships: {
            stakeholderPartnership: this.projectData.partnerships.stakeholder_partnerships.map((item) => {
              return { name: item };
            })
          }
        }
      });
    }

    if (this.projectData.partnerships.indigenous_partnerships.length) {
      const names = this.codes.first_nations
        .filter((item) => this.projectData.partnerships.indigenous_partnerships.includes(item.id))
        .map((item) => item.name);

      data.push({
        describes: this.projectData.project.uuid,
        metadata: {
          firstNationPartnerships: {
            firstNationPartnership: names.map((item) => {
              return { name: item };
            })
          }
        }
      });
    }

    // TODO add back when survey supports permits
    // if (this.includeSensitiveData) {
    //   // only include permits if sensitive data is enabled
    //   if (this.projectData.permit.permits?.length) {
    //     data.push({
    //       describes: this.projectData.project.uuid,
    //       metadata: {
    //         permits: {
    //           permit: this.projectData.permit.permits.map((item) => {
    //             return { permitType: item.permit_type, permitNumber: item.permit_number };
    //           })
    //         }
    //       }
    //     });
    //   }
    // }

    // TODO add back when survey supports permits
    // if (this.includeSensitiveData) {
    //   // only include permits if sensitive data is enabled
    //   this.surveyData.forEach((item) => {
    //     if (item.permit.permit_number && item.permit.permit_type) {
    //       data.push({
    //         describes: item.survey_details.uuid,
    //         metadata: {
    //           permits: {
    //             permit: { permitType: item.permit.permit_type, permitNumber: item.permit.permit_number }
    //           }
    //         }
    //       });
    //     }
    //   });
    // }

    this.surveyData.forEach((item) => {
      if (item.proprietor) {
        data.push({
          describes: item.survey_details.uuid,
          metadata: {
            proprietaryDataCategory: item.proprietor.proprietor_type_name
          }
        });

        data.push({
          describes: item.survey_details.uuid,
          metadata: {
            proprietorName: item.proprietor.proprietor_name
          }
        });

        data.push({
          describes: item.survey_details.uuid,
          metadata: {
            proprietaryDataCategoryRationale: item.proprietor.category_rationale
          }
        });

        data.push({
          describes: item.survey_details.uuid,
          metadata: {
            dataSharingAgreementRequired: item.proprietor.disa_required
          }
        });
      }
    });

    this.surveyData.forEach((item) => {
      data.push({
        describes: item.survey_details.uuid,
        metadata: {
          surveyedAllAreas: item.purpose_and_methodology.surveyed_all_areas === 'true' || false
        }
      });
    });

    if (this.projectAttachmentData?.attachmentDetails.length) {
      data.push({
        describes: this.projectData.project.uuid,
        metadata: {
          projectAttachments: {
            projectAttachment: this.projectAttachmentData.attachmentDetails.map((item) => {
              return item;
            })
          }
        }
      });
    }

    if (this.projectReportAttachmentData?.attachmentDetails.length) {
      data.push({
        describes: this.projectData.project.uuid,
        metadata: {
          projectReportAttachments: {
            projectReportAttachment: this.projectReportAttachmentData.attachmentDetails.map((item) => {
              return item;
            })
          }
        }
      });
    }

    this.surveyData.forEach((item) => {
      if (item.attachments?.attachmentDetails.length) {
        data.push({
          describes: item.survey_details.uuid,
          metadata: {
            surveyAttachments: {
              surveyAttachment: item.attachments?.attachmentDetails.map((item) => {
                return item;
              })
            }
          }
        });
      }
    });

    this.surveyData.forEach((item) => {
      if (item.report_attachments?.attachmentDetails.length) {
        data.push({
          describes: item.survey_details.uuid,
          metadata: {
            surveyReportAttachments: {
              surveyReportAttachment: item.report_attachments?.attachmentDetails.map((item) => {
                return item;
              })
            }
          }
        });
      }
    });

    jsonpatch.applyOperation(this.data, {
      op: 'add',
      path: '/eml:eml/additionalMetadata',
      value: data
    });
  }

  getDatasetCreator(): Record<any, any> {
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
   * @
   * @return {*}  {Record<any, any>}
   * @memberof EmlService
   */
  getProjectContact(): Record<any, any> {
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
   * @
   * @return {*}  {Record<any, any>[]}
   * @memberof EmlService
   */
  getProjectPersonnel(): Record<any, any>[] {
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

  /**
   * Get all contacts for the survey.
   *
   * @
   * @param {SurveyObjectWithAttachments} surveyData
   * @return {*}  {Record<any, any>[]}
   * @memberof EmlService
   */
  getSurveyPersonnel(surveyData: SurveyObjectWithAttachments): Record<any, any>[] {
    return [
      {
        individualName: {
          givenName: surveyData.survey_details.biologist_first_name,
          surName: surveyData.survey_details.biologist_last_name
        },
        role: 'pointOfContact'
      }
    ];
  }

  getProjectFundingSources(): Record<any, any> {
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

  getSurveyFundingSources(surveyData: SurveyObjectWithAttachments): Record<any, any> {
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

  getTemporalCoverageEML(): Record<any, any> {
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

  getSurveyTemporalCoverageEML(surveyData: SurveyObjectWithAttachments): Record<any, any> {
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

  getGeographicCoverageEML(): Record<any, any> {
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

  getSurveyGeographicCoverageEML(surveyData: SurveyObjectWithAttachments): Record<any, any> {
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

  async getSurveyFocalTaxonomicCoverage(surveyData: SurveyObjectWithAttachments): Promise<Record<any, any>> {
    const taxonomySearchService = new TaxonomyService();

    // TODO include ancillary_species alongside focal_species?
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

  async getSurveyDesignDescription(surveyData: SurveyObjectWithAttachments): Promise<Record<any, any>> {
    return {
      description: {
        section: [
          {
            title: 'Field Method',
            para: this.codes.field_methods.find(
              (code) => code.id === surveyData.purpose_and_methodology.field_method_id
            )?.name
          },
          {
            title: 'Ecological Season',
            para: this.codes.ecological_seasons.find(
              (code) => code.id === surveyData.purpose_and_methodology.ecological_season_id
            )?.name
          },
          {
            title: 'Vantage Codes',
            para: {
              itemizedlist: {
                listitem: this.codes.vantage_codes
                  .filter((code) => surveyData.purpose_and_methodology.vantage_code_ids.includes(code.id))
                  .map((item) => {
                    return { para: item.name };
                  })
              }
            }
          }
        ]
      }
    };
  }

  async getSurveysEML(): Promise<Record<any, any>[]> {
    const promises: Promise<Record<any, any>>[] = [];

    this.surveyData.forEach((item) => {
      promises.push(this.getSurveyEML(item));
    });

    return Promise.all(promises);
  }

  async getSurveyEML(surveyData: SurveyObjectWithAttachments): Promise<Record<any, any>> {
    return {
      $: { id: surveyData.survey_details.uuid, system: this.constants.EML_PROVIDER_URL },
      title: surveyData.survey_details.survey_name,
      personnel: this.getSurveyPersonnel(surveyData),
      abstract: {
        section: [
          {
            title: 'Intended Outcomes',
            para: this.codes.intended_outcomes.find(
              (code) => code.id === surveyData.purpose_and_methodology.intended_outcome_id
            )?.name
          },
          {
            title: 'Additional Details',
            para: surveyData.purpose_and_methodology.additional_details || NOT_SUPPLIED_CONSTANT
          }
        ]
      },
      ...this.getSurveyFundingSources(surveyData),
      studyAreaDescription: {
        coverage: {
          ...this.getSurveyGeographicCoverageEML(surveyData),
          temporalCoverage: this.getSurveyTemporalCoverageEML(surveyData),
          taxonomicCoverage: await this.getSurveyFocalTaxonomicCoverage(surveyData)
        }
      },
      designDescription: await this.getSurveyDesignDescription(surveyData)
    };
  }
}
