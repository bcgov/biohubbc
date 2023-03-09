import { SearchHit } from '@elastic/elasticsearch/lib/api/types';
import bbox from '@turf/bbox';
import circle from '@turf/circle';
import { AllGeoJSON, featureCollection } from '@turf/helpers';
import { coordEach } from '@turf/meta';
import jsonpatch from 'fast-json-patch';
import { Feature, GeoJsonProperties, Geometry } from 'geojson';
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
import { DBService } from './db-service';
import { ProjectService } from './project-service';
import { SurveyService } from './survey-service';
import { TaxonomyService, ITaxonomySource } from './taxonomy-service';

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

type SurveyObjectWithAttachments = SurveyObject & {
  attachments?: GetSurveyAttachmentsData;
  report_attachments?: GetSurveyReportAttachmentsData;
};


type ProjectMetadataSource = {
  projectData: IGetProject;
  projectAttachmentsData: GetProjectAttachmentsData;
  projectReportAttachmentsData: GetProjectReportAttachmentsData;
  surveys: SurveyObjectWithAttachments[];
};

type BuildProjectEmlOptions = {
  projectId: number;
};

type EmlString = string;

type AdditionalMetadata = {
  describes: string;
  metadata: Record<string, any>
}

class EmlPackage {
  packageId: string;
  
  _xml2jsBuilder: xml2js.Builder;
  
  _data: Record<string, unknown> = {};

  _emlMetadata: Record<string, any> | null = null;
  _datasetMetadata: Record<string, any> | null = null;
  _relatedProjects: Record<string, any>[] = [];
  _additionalMetadata: AdditionalMetadata[] = [];

  constructor(options: { packageId: string }) {
    // this._source = options.source;
    this.packageId = options.packageId;

    this._xml2jsBuilder = new xml2js.Builder({ renderOpts: { pretty: false } });
  }

  withEml(emlMetadata: Record<string, any>) {
    this._emlMetadata = emlMetadata;  

    return this;
  }

  withDataset(datasetMetadata: Record<string, any>) {
    this._datasetMetadata = datasetMetadata;

    return this;
  }

  withAdditionalMetadata(additionalMetadata: AdditionalMetadata[]) {
    additionalMetadata.forEach((meta) => this._additionalMetadata.push(meta));
    
    return this;
  }

  withRelatedProjects(relatedProjects: Record<string, any>[]) {
    relatedProjects.forEach((project) => this._relatedProjects.push(project));

    return this;
  }

  build(): EmlString {
    if (this._relatedProjects.length) {
      if (!this._datasetMetadata) {
        throw new Error("Can't build related projects EML without first building dataset EML.");
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
  
    return this._xml2jsBuilder.buildObject(this._data);
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

  projectService: ProjectService;
  surveyService: SurveyService;
  codeService: CodeService;

  constants: EmlDbConstants = DEFAULT_DB_CONSTANTS;

  _codes: IAllCodeSets | null;

  constructor(connection: IDBConnection) {
    super(connection);

    this.projectService = new ProjectService(this.connection);
    this.surveyService = new SurveyService(this.connection);
    this.codeService = new CodeService(this.connection);
    this._codes = null;
  }

  /**
   * Compiles and returns the project metadata as an EML-compliant XML string.
   *
   * @param {BuildProjectEmlOptions} options
   * @return {*}  {Promise<EmlString>}
   * @memberof EmlService
   */
  async createProjectEml(options: BuildProjectEmlOptions): Promise<EmlPackage> {
    const { projectId } = options;
    await this.loadEmlDbConstants();

    const projectSource = await this.loadProjectSource(projectId);
    const packageId = projectSource.projectData.project.uuid;

    const emlPackage = new EmlPackage({ packageId });

    return emlPackage
      .withEml(this.buildProjectEmlSection(packageId))
      .withDataset(await this.buildProjectEmlDatasetSection(projectSource.projectData, packageId))
      .withAdditionalMetadata(await this.getProjectAdditionalMetadata(projectSource))
      .withAdditionalMetadata(this.getSurveyAdditionalMetadata(projectSource))
      .withRelatedProjects(await this.buildAllSurveyEmlDatasetSections(projectSource.surveys));

  }

  async codes(): Promise<IAllCodeSets> {
    if (!this._codes) {
      this._codes = await this.codeService.getAllCodeSets();
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

    this.constants.EML_ORGANIZATION_URL = organizationUrl.rows[0].constant || NOT_SUPPLIED;
    this.constants.EML_ORGANIZATION_NAME = organizationName.rows[0].constant || NOT_SUPPLIED;
    this.constants.EML_PROVIDER_URL = providerURL.rows[0].constant || NOT_SUPPLIED;
    this.constants.EML_SECURITY_PROVIDER_URL = securityProviderURL.rows[0].constant || NOT_SUPPLIED;
    this.constants.EML_ORGANIZATION_URL = organizationURL.rows[0].constant || NOT_SUPPLIED;
    this.constants.EML_INTELLECTUAL_RIGHTS = intellectualRights.rows[0].constant || NOT_SUPPLIED;
    this.constants.EML_TAXONOMIC_PROVIDER_URL = taxonomicProviderURL.rows[0].constant || NOT_SUPPLIED;
  }

  /**
   * Loads all source data needed to produce a project EML package
   * @param {number} projectId The ID of the project
   */
  async loadProjectSource(projectId: number): Promise<ProjectMetadataSource> {
    // Fetch project data
    const projectData = await this.projectService.getProjectById(projectId);

    // Fetch project attachments
    const projectAttachmentsData = await this.projectService.getAttachmentsData(projectId);
    const projectReportAttachmentsData = await this.projectService.getReportAttachmentsData(projectId);

    // Fetch surveys with all respective attachments
    const surveys = await this.surveyService.getSurveysByProjectId(projectId)
      .then(async (surveys: SurveyObject[]) => {
        return Promise.all(surveys.map(async (survey: SurveyObject) => ({
          ...survey,
          attachments: await this.surveyService.getAttachmentsData(survey.survey_details.id),
          reportAttachments: await this.surveyService.getReportAttachmentsData(survey.survey_details.id)
        })));
      });

    return {
      projectData,
      projectAttachmentsData,
      projectReportAttachmentsData,
      surveys
    }
  }

  buildProjectEmlSection(packageId: string) {
    return {
      $: {
        packageId: `urn:uuid:${packageId}`,
        system: EMPTY_STRING,
        'xmlns:eml': 'https://eml.ecoinformatics.org/eml-2.2.0',
        'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
        'xmlns:stmml': 'http://www.xml-cml.org/schema/schema24',
        'xsi:schemaLocation': 'https://eml.ecoinformatics.org/eml-2.2.0 xsd/eml.xsd'
      }
    }
  }

  async buildProjectEmlDatasetSection(projectData: IGetProject, packageId: string): Promise<Record<string, any>> {
    return {
      $: { system: EMPTY_STRING, id: packageId },
      title: projectData.project.project_name,
      creator: this.getDatasetCreator(projectData),
      // EML specification expects short ISO format
      pubDate: new Date().toISOString().substring(0, 10),
      language: 'English',
      contact: this.getProjectContact(projectData),
      project: {
        $: { id: projectData.project.uuid, system: EMPTY_STRING },
        title: projectData.project.project_name,
        personnel: this.getProjectPersonnel(projectData),
        abstract: {
          section: [
            { title: 'Objectives', para: projectData.objectives.objectives },
            { title: 'Caveats', para: projectData.objectives.caveats || NOT_SUPPLIED }
          ]
        },
        ...this.getProjectFundingSources(projectData),
        studyAreaDescription: {
          coverage: {
            ...this.getProjectGeographicCoverage(projectData),
            temporalCoverage: this.getProjectTemporalCoverage(projectData)
          }
        }
      }
    }
  }

  /**
   * @TODO jsdoc
   *
   * @param {ProjectMetadataSource} projectSource
   * @return {*}  {AdditionalMetadata[]}
   * @memberof EmlService
   */
  getSurveyAdditionalMetadata(projectSource: ProjectMetadataSource): AdditionalMetadata[] {
    const additionalMetadata: AdditionalMetadata[] = [];
    const { surveys } = projectSource;

    surveys.forEach((survey: SurveyObjectWithAttachments) => {
      if (survey.attachments?.attachmentDetails.length) {
        additionalMetadata.push({
          describes: survey.survey_details.uuid,
          metadata: {
            surveyAttachments: {
              surveyAttachment: survey.attachments?.attachmentDetails
            }
          }
        });
      }
    });

    surveys.forEach((survey: SurveyObjectWithAttachments) => {
      if (survey.report_attachments?.attachmentDetails.length) {
        additionalMetadata.push({
          describes: survey.survey_details.uuid,
          metadata: {
            surveyReportAttachments: {
              surveyReportAttachment: survey.report_attachments?.attachmentDetails
            }
          }
        });
      }
    });

    return additionalMetadata;
  }

  /**
   * @TODO jsdoc
   *
   * @param {ProjectMetadataSource} projectSource
   * @return {*}  {Promise<AdditionalMetadata[]>}
   * @memberof EmlService
   */
  async getProjectAdditionalMetadata(projectSource: ProjectMetadataSource): Promise<AdditionalMetadata[]> {
    const additionalMetadata: AdditionalMetadata[] = [];
    const codes = await this.codes();

    const { projectData, projectAttachmentsData, projectReportAttachmentsData } = projectSource;

    if (projectData.project.project_type) {
      additionalMetadata.push({
        describes: projectData.project.uuid,
        metadata: {
          projectTypes: {
            projectType: codes.project_type.find((code) => projectData.project.project_type === code.id)?.name
          }
        }
      });
    }

    if (projectData.project.project_activities.length) {
      const names = codes.activity
        .filter((code) => projectData.project.project_activities.includes(code.id))
        .map((code) => code.name);

      additionalMetadata.push({
        describes: projectData.project.uuid,
        metadata: {
          projectActivities: {
            projectActivity: names.map((item) => {
              return { name: item };
            })
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

    if (projectData.partnerships.stakeholder_partnerships?.length) {
      additionalMetadata.push({
        describes: projectData.project.uuid,
        metadata: {
          stakeholderPartnerships: {
            stakeholderPartnership: projectData.partnerships.stakeholder_partnerships.map((item) => {
              return { name: item };
            })
          }
        }
      });
    }

    if (projectData.partnerships.indigenous_partnerships.length) {
      const names = codes.first_nations
        .filter((code) => projectData.partnerships.indigenous_partnerships.includes(code.id))
        .map((code) => code.name);

        additionalMetadata.push({
        describes: projectData.project.uuid,
        metadata: {
          firstNationPartnerships: {
            firstNationPartnership: names.map((name) => {
              return { name };
            })
          }
        }
      });
    }

    if (projectAttachmentsData?.attachmentDetails.length) {
      additionalMetadata.push({
        describes: projectData.project.uuid,
        metadata: {
          projectAttachments: {
            projectAttachment: projectAttachmentsData.attachmentDetails
          }
        }
      });
    }

    if (projectReportAttachmentsData?.attachmentDetails.length) {
      additionalMetadata.push({
        describes: projectData.project.uuid,
        metadata: {
          projectReportAttachments: {
            projectReportAttachment: projectReportAttachmentsData.attachmentDetails
          }
        }
      });
    }

    return additionalMetadata;
  }

  /**
   * Creates an object representing the dataset creator from the given projectData.
   *
   * @param {IGetProject} projectData
   * @return {*}  {Record<string, any>}
   * @memberof EmlService
   */
  getDatasetCreator(projectData: IGetProject): Record<string, any> {
    const primaryContact = projectData.coordinator;

    if (JSON.parse(primaryContact.share_contact_details)) {
      // return full details of the primary contact iff it is public.
      return {
        organizationName: primaryContact.coordinator_agency,
        electronicMailAddress: primaryContact.email_address
      };
    }

    return { organizationName: primaryContact.coordinator_agency };
  }

  /**
   * Creates an object representing the primary contact for the given project.
   *
   * @param {IGetProject} projectData
   * @return {*}  {Record<string, any>}
   * @memberof EmlService
   */
  getProjectContact(projectData: IGetProject): Record<string, any> {
    const primaryContact = projectData.coordinator;

    if (JSON.parse(primaryContact.share_contact_details)) {
      // return full details of the primary contact iff it is public
      return {
        individualName: { givenName: primaryContact.first_name, surName: primaryContact.last_name },
        organizationName: primaryContact.coordinator_agency,
        electronicMailAddress: primaryContact.email_address
      };
    }

    return { organizationName: primaryContact.coordinator_agency };
  }

  /**
   * Creates an object representing all contacts for the given project.
   *
   * @param {IGetProject} projectData
   * @return {*}  {Record<string, any>[]}
   * @memberof EmlService
   */
  getProjectPersonnel(projectData: IGetProject): Record<string, any>[] {
    const primaryContact = projectData.coordinator;

    if (JSON.parse(primaryContact.share_contact_details)) {
      // return full details of the primary contact iff it is public
      return [
        {
          individualName: { givenName: primaryContact.first_name, surName: primaryContact.last_name },
          organizationName: primaryContact.coordinator_agency,
          electronicMailAddress: primaryContact.email_address,
          role: 'pointOfContact'
        }
      ];
    }

    return [{ organizationName: primaryContact.coordinator_agency }];
  }

  /**
   * Creates an object representing all contacts for the given survey.
   *
   * @param {SurveyObjectWithAttachments} surveyData
   * @return {*}  {Record<string, any>[]}
   * @memberof EmlService
   */
  getSurveyPersonnel(surveyData: SurveyObjectWithAttachments): Record<string, any>[] {
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

  /**
   * Creates an object representing all funding sources for the given project.
   *
   * @param {IGetProject} projectData
   * @return {*}  {Record<string, any>}
   * @memberof EmlService
   */
  getProjectFundingSources(projectData: IGetProject): Record<string, any> {
    if (!projectData.funding.fundingSources.length) {
      return {};
    }

    return {
      funding: {
        section: projectData.funding.fundingSources.map((fundingSource) => {
          return {
            title: 'Agency Name',
            para: fundingSource.agency_name,
            section: [
              { title: 'Funding Agency Project ID', para: fundingSource.agency_project_id },
              { title: 'Investment Action/Category', para: fundingSource.investment_action_category_name },
              { title: 'Funding Amount', para: fundingSource.funding_amount },
              { title: 'Funding Start Date', para: new Date(fundingSource.start_date).toISOString().split('T')[0] },
              { title: 'Funding End Date', para: new Date(fundingSource.end_date).toISOString().split('T')[0] }
            ]
          };
        })
      }
    };
  }

  /**
   * Creates an object representing all funding sources for the given survey.
   *
   * @param {SurveyObjectWithAttachments} surveyData
   * @return {*}  {Record<string, any>}
   * @memberof EmlService
   */
  getSurveyFundingSources(surveyData: SurveyObjectWithAttachments): Record<string, any> {
    if (!surveyData.funding.funding_sources.length) {
      return {};
    }

    return {
      funding: {
        section: surveyData.funding.funding_sources.map((fundingSource) => {
          return {
            title: 'Agency Name',
            para: fundingSource.agency_name,
            section: [
              { title: 'Funding Agency Project ID', para: fundingSource.funding_source_project_id },
              { title: 'Investment Action/Category', para: fundingSource.investment_action_category_name },
              { title: 'Funding Amount', para: fundingSource.funding_amount },
              { title: 'Funding Start Date', para: new Date(fundingSource.funding_start_date).toISOString().split('T')[0] },
              { title: 'Funding End Date', para: new Date(fundingSource.funding_end_date).toISOString().split('T')[0] }
            ]
          };
        })
      }
    };
  }

  /**
   * Creates an object representing temporal coverage for the given project
   *
   * @param {IGetProject} projectData
   * @return {*}  {Record<string, any>}
   * @memberof EmlService
   */
  getProjectTemporalCoverage(projectData: IGetProject): Record<string, any> {
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
   * @param {SurveyObjectWithAttachments} surveyData
   * @return {*}  {Record<string, any>}
   * @memberof EmlService
   */
  getSurveyTemporalCoverage(surveyData: SurveyObjectWithAttachments): Record<string, any> {
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
   * @TODO jsdoc
   *
   * @param {Feature<Geometry, GeoJsonProperties>[]} geometry
   * @return {*}  {Feature<Geometry, GeoJsonProperties>[]}
   * @memberof EmlService
   */
  makePolygonFeatures(geometry: Feature<Geometry, GeoJsonProperties>[]): Feature<Geometry, GeoJsonProperties>[] {
    return geometry.map((feature) => {
      if (feature.geometry.type === 'Point' && feature.properties?.radius) {
        return circle(feature.geometry, feature.properties.radius, { units: 'meters' });
      }

      return feature;
    });
  }

  /**
   * @TODO jsdoc
   *
   * @param {Feature<Geometry, GeoJsonProperties>[]} polygonFeatures
   * @return {*}  {Record<string, any>[]}
   * @memberof EmlService
   */
  makeDatasetGPolygons(polygonFeatures: Feature<Geometry, GeoJsonProperties>[]): Record<string, any>[] {
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
  getProjectGeographicCoverage(projectData: IGetProject): Record<string, any> {
    if (!projectData.location.geometry) {
      return {};
    }

    const polygonFeatures = this.makePolygonFeatures(projectData.location.geometry);
    const datasetGPolygons = this.makeDatasetGPolygons(polygonFeatures);
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
   * @param {SurveyObjectWithAttachments} surveyData
   * @return {*}  {Record<string, any>}
   * @memberof EmlService
   */
  getSurveyGeographicCoverage(surveyData: SurveyObjectWithAttachments): Record<string, any> {
    if (!surveyData.location.geometry?.length) {
      return {};
    }

    const polygonFeatures = this.makePolygonFeatures(surveyData.location.geometry);
    const datasetGPolygons = this.makeDatasetGPolygons(polygonFeatures);
    const surveyBoundingBox = bbox(featureCollection(polygonFeatures));

    return {
      geographicCoverage: {
        geographicDescription: surveyData.location.survey_area_name,
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
   * @param {SurveyObjectWithAttachments} surveyData
   * @return {*}  {Promise<Record<string, any>>}
   * @memberof EmlService
   */
  async getSurveyFocalTaxonomicCoverage(surveyData: SurveyObjectWithAttachments): Promise<Record<string, any>> {
    const taxonomySearchService = new TaxonomyService();

    const response = await taxonomySearchService.getTaxonomyFromIds(surveyData.species.focal_species);

    const taxonomicClassification: Record<string, any>[] = [];

    response.forEach((taxonResult: SearchHit<ITaxonomySource>) => {
      const { _source } = taxonResult;

      if (_source) {
        taxonomicClassification.push({
          taxonRankName: _source.tty_name,
          taxonRankValue: `${_source.unit_name1} ${_source.unit_name2} ${_source.unit_name3}`,
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
   * @TODO jsdoc
   *
   * @param {SurveyObjectWithAttachments} surveyData
   * @return {*}  {Promise<Record<string, any>>}
   * @memberof EmlService
   */
  async getSurveyDesignDescription(survey: SurveyObjectWithAttachments): Promise<Record<string, any>> {
    const codes = await this.codes();

    return {
      description: {
        section: [
          {
            title: 'Field Method',
            para: codes.field_methods.find(
              (code) => code.id === survey.purpose_and_methodology.field_method_id
            )?.name
          },
          {
            title: 'Ecological Season',
            para: codes.ecological_seasons.find(
              (code) => code.id === survey.purpose_and_methodology.ecological_season_id
            )?.name
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
   * @TODO jsdoc
   *
   * @param {SurveyObjectWithAttachments[]} surveys
   * @return {*}  {Promise<Record<string, any>[]>}
   * @memberof EmlService
   */
  async buildAllSurveyEmlDatasetSections(surveys: SurveyObjectWithAttachments[]): Promise<Record<string, any>[]> {
    return Promise.all(surveys.map(async (survey) => await this.buildSurveyEmlDatasetSection(survey)));
  }

  /**
   * @TODO jsdoc
   *
   * @param {SurveyObjectWithAttachments} surveyData
   * @return {*}  {Promise<Record<string, any>>}
   * @memberof EmlService
   */
  async buildSurveyEmlDatasetSection(surveyData: SurveyObjectWithAttachments): Promise<Record<string, any>> {
    const codes = await this.codes();

    return {
      $: { id: surveyData.survey_details.uuid, system: EMPTY_STRING },
      title: surveyData.survey_details.survey_name,
      personnel: this.getSurveyPersonnel(surveyData),
      abstract: {
        section: [
          {
            title: 'Intended Outcomes',
            para: codes.intended_outcomes.find(
              (code) => code.id === surveyData.purpose_and_methodology.intended_outcome_id
            )?.name
          },
          {
            title: 'Additional Details',
            para: surveyData.purpose_and_methodology.additional_details || NOT_SUPPLIED
          }
        ]
      },
      ...this.getSurveyFundingSources(surveyData),
      studyAreaDescription: {
        coverage: {
          ...this.getSurveyGeographicCoverage(surveyData),
          temporalCoverage: this.getSurveyTemporalCoverage(surveyData),
          taxonomicCoverage: await this.getSurveyFocalTaxonomicCoverage(surveyData)
        }
      },
      designDescription: await this.getSurveyDesignDescription(surveyData)
    };
  }
}
