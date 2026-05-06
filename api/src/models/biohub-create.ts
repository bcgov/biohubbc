import { Feature, FeatureCollection } from 'geojson';
import crypto from 'node:crypto';
import { ATTACHMENT_TYPE } from '../constants/attachments';
import { DeviceRecord } from '../database-models/device';
import { SurveyObservationRecord } from '../database-models/survey_observation';
import { ISurveyAttachment, ISurveyReportAttachment } from '../repositories/attachment-repository';
import { SurveyHabitatFeatureWithTaxonsAndSampling } from '../repositories/habitat-feature-repository/survey-habitat-feature-repository.interface';
import {
  QualitativeEnvironmentTypeDefinition,
  QuantitativeEnvironmentTypeDefinition
} from '../repositories/observation-environment-repository';
import { ObservationRecordWithSamplingAndSubcountData } from '../repositories/observation-repository/observation-repository.interface';
import { SurveySamplePeriodDetails } from '../repositories/sample-period-repository';
import { SurveyLocationRecord } from '../repositories/survey-location-repository';
import { ExtendedDeploymentRecord } from '../repositories/telemetry-repositories/telemetry-deployment-repository.interface';
import { Telemetry } from '../repositories/telemetry-repositories/telemetry-vendor-repository.interface';
import {
  CBQualitativeMeasurementTypeDefinition,
  CBQuantitativeMeasurementTypeDefinition,
  ICritterDetailed
} from '../services/critterbase-service';
import { ITaxonomyWithEcologicalUnits } from '../services/platform-service';
import { SampleTechniqueRecord } from '../services/sample-technique-service';
import { getLogger } from '../utils/logger';
import { GetSurveyData, GetSurveyPurposeAndMethodologyData } from './survey-view';

// Extended interface for sampling sites with geometry data
interface SampleSiteRecordWithGeojson {
  name: string;
  description: string | null;
  blocks?: { name: string; description: string }[];
  geojson: Feature | null;
}

// Measurement record types
interface MeasurementRecord {
  comment?: string | null;
  measurement_comment?: string | null;
  measurement_name?: string | null;
  value?: number | null;
}

// Mortality record types
interface MortalityLocation {
  longitude: number;
  latitude: number;
}

interface ProximateCauseOfDeath {
  cod_category?: string;
  cod_reason?: string;
}

interface MortalityRecord {
  mortality_comment?: string | null;
  mortality_timestamp: string;
  location?: MortalityLocation | null;
  proximate_cause_of_death?: ProximateCauseOfDeath | null;
}

// Codeset types for exporting codetables
export interface CodesetCode {
  key: string;
  label: string;
  description: string | null;
  external_id: string | null;
}

export interface CodesetCategory {
  key: string;
  label: string;
  description: string | null;
  codes: CodesetCode[];
}

export interface CodesetExportContext {
  categoryAliasByName: Record<string, string>;
  categoryNameByAlias: Record<string, string>;
  codeAliasByCategoryAndId: Record<string, Record<string, string>>;
  codeIdByCategoryAndAlias: Record<string, Record<string, string>>;
}

/** Empty codeset export context for tests or when no category/code alias mapping is needed. */
export const minimalCodesetExportContext: CodesetExportContext = {
  categoryAliasByName: {},
  categoryNameByAlias: {},
  codeAliasByCategoryAndId: {},
  codeIdByCategoryAndAlias: {}
};

const defaultLog = getLogger('models/biohub-create');

interface BioHubSubmission {
  id: string;
  name: string;
  description: string;
  content: BioHubSubmissionFeature;
}

interface PostSurveySubmissionInputData {
  surveyGeometry: FeatureCollection;
  surveyAttachments: ISurveyAttachment[];
  surveyReports: ISurveyReportAttachment[];
  submissionComment: string;
}

interface PostSurveyToBiohubOptions {
  animalRecords?: ICritterDetailed[];
  environmentDefinitions?: {
    qualitative_environments: QualitativeEnvironmentTypeDefinition[];
    quantitative_environments: QuantitativeEnvironmentTypeDefinition[];
  };
  measurementDefinitions?: {
    qualitative_measurements: CBQualitativeMeasurementTypeDefinition[];
    quantitative_measurements: CBQuantitativeMeasurementTypeDefinition[];
  };
  samplingSites?: SampleSiteRecordWithGeojson[];
  samplingPeriods?: SurveySamplePeriodDetails[];
  habitatFeatures?: SurveyHabitatFeatureWithTaxonsAndSampling[];
  telemetryDevices?: DeviceRecord[];
  telemetryDeployments?: ExtendedDeploymentRecord[];
  telemetry?: Telemetry[];
  samplingTechniques?: SampleTechniqueRecord[];
  partnerships?: { indigenous_partnerships: number[]; stakeholder_partnerships: string[] };
  focalSpecies?: { focal_species: ITaxonomyWithEcologicalUnits[] };
  surveyLocation?: SurveyLocationRecord[];
  firstNations?: { id: number; name: string }[];
  strata?: { name: string; description: string }[];
  siteSelectionStrategies?: number[];
  codesetCategories?: CodesetCategory[];
  includeFeatureTypes?: Set<BiohubFeatureType>;
}

type PostSurveySubmissionOptions = PostSurveyToBiohubOptions;
export interface BioHubSubmissionFeature {
  id: string;
  type: string;
  properties: Record<string, unknown>;
  child_features: BioHubSubmissionFeature[];
}

interface PostSurveyCaptureToBiohubOptions {
  includeMarking?: boolean;
  includeMeasurement?: boolean;
  includeRelease?: boolean;
}

interface PostSurveyAnimalToBiohubOptions {
  includeCapture?: boolean;
  includeMortality?: boolean;
  includeEcologicalUnit?: boolean;
  includeMarking?: boolean;
  includeMeasurement?: boolean;
  includeRelease?: boolean;
}

interface PostSurveySamplingSiteToBiohubOptions {
  includeBlock?: boolean;
  includeStratum?: boolean;
}

export interface PostSurveyObservationToBiohubOptions {
  environmentDefinitions?: {
    qualitative_environments: QualitativeEnvironmentTypeDefinition[];
    quantitative_environments: QuantitativeEnvironmentTypeDefinition[];
  };
  measurementDefinitions?: {
    qualitative_measurements: CBQualitativeMeasurementTypeDefinition[];
    quantitative_measurements: CBQuantitativeMeasurementTypeDefinition[];
  };
  codesetExportContext: CodesetExportContext;
}

/**
 * Object to be sent to Biohub API for creating an observation.
 *
 * @export
 * @class PostSurveyObservationToBiohubObject
 * @implements {BioHubSubmissionFeature}
 */
export class PostSurveyObservationToBiohubObject implements BioHubSubmissionFeature {
  id: string;
  type: string;
  properties: Record<string, unknown>;
  child_features: BioHubSubmissionFeature[];

  constructor(
    observationRecord: SurveyObservationRecord | ObservationRecordWithSamplingAndSubcountData,
    options: PostSurveyObservationToBiohubOptions
  ) {
    defaultLog.debug({ label: 'PostSurveyObservationToBiohubObject', message: 'params', observationRecord });

    const { environmentDefinitions, measurementDefinitions, codesetExportContext } = options;

    // Combine date and time into a single timestamp
    const timestamp = observationRecord.observation_time
      ? `${observationRecord.observation_date}T${observationRecord.observation_time}`
      : observationRecord.observation_date;

    this.id = crypto.randomUUID();
    this.type = BiohubFeatureType.OBSERVATION;
    let environmental_condition: string | null = null;
    let environmental_condition_value: string | null = null;
    if ('qualitative_environments' in observationRecord && observationRecord.qualitative_environments?.[0]) {
      const env = observationRecord.qualitative_environments[0];
      environmental_condition = `code::environment_qualitative::${env.environment_qualitative_id}`;
      environmental_condition_value = `code::environment_qualitative_option::${env.environment_qualitative_option_id}`;
    } else if ('quantitative_environments' in observationRecord && observationRecord.quantitative_environments?.[0]) {
      const env = observationRecord.quantitative_environments[0];
      const envDef = environmentDefinitions?.quantitative_environments.find(
        (def) => def.environment_quantitative_id === env.environment_quantitative_id
      );
      const unitSuffix = envDef?.unit ? ' ' + envDef.unit : '';
      environmental_condition = `code::environment_quantitative::${env.environment_quantitative_id}`;
      environmental_condition_value = `${env.value}${unitSuffix}`;
    }

    let subcount_comment: string | null = null;
    let subcount_count: number | null = null;
    let subcount_measurement_type: string | null = null;
    let subcount_measurement_value: number | null = null;
    if ('subcounts' in observationRecord && observationRecord.subcounts?.[0]) {
      const subcount = observationRecord.subcounts[0];
      subcount_comment = subcount.comment;
      subcount_count = subcount.subcount;
      if (subcount.quantitative_measurements?.[0]) {
        const measurement = subcount.quantitative_measurements[0];
        const measurementDef = measurementDefinitions?.quantitative_measurements.find(
          (def) => def.taxon_measurement_id === measurement.critterbase_taxon_measurement_id
        );
        subcount_measurement_type = measurementDef?.measurement_name || measurement.critterbase_taxon_measurement_id;
        subcount_measurement_value = measurement.value;
      }
    }

    this.properties = {
      survey_id: observationRecord.survey_id,
      taxon_id: observationRecord.itis_tsn,
      survey_sample_period_id: observationRecord?.survey_sample_period_id || null,
      count: observationRecord.count,
      timestamp: timestamp,
      sign: observationRecord.observation_sign_id
        ? buildCodesetReference('observation_sign', observationRecord.observation_sign_id, codesetExportContext)
        : null,
      geometry:
        observationRecord.longitude && observationRecord.latitude
          ? {
              type: 'FeatureCollection',
              features: [
                {
                  type: 'Feature',
                  geometry: {
                    type: 'Point',
                    coordinates: [observationRecord.longitude, observationRecord.latitude]
                  },
                  properties: {}
                }
              ]
            }
          : null,
      environmental_condition,
      environmental_condition_value,
      subcount_comment,
      subcount_count,
      subcount_measurement_type,
      subcount_measurement_value
    };

    this.child_features = [];
  }
}

/**
 * Object to be sent to Biohub API for creating a capture.
 *
 * @export
 * @class PostSurveyCaptureToBiohubObject
 * @implements {BioHubSubmissionFeature}
 */
export class PostSurveyCaptureToBiohubObject implements BioHubSubmissionFeature {
  id: string;
  type: string;
  properties: Record<string, unknown>;
  child_features: BioHubSubmissionFeature[];

  constructor(captureRecord: ICritterDetailed['captures'][0], options: PostSurveyCaptureToBiohubOptions = {}) {
    defaultLog.debug({ label: 'PostSurveyCaptureToBiohubObject', message: 'params', captureRecord });
    const { includeMarking = true, includeMeasurement = true, includeRelease = true } = options;

    // Combine date and time into a single timestamp
    const timestamp = captureRecord.capture_time
      ? `${captureRecord.capture_date}T${captureRecord.capture_time}`
      : captureRecord.capture_date;

    this.id = crypto.randomUUID();
    this.type = BiohubFeatureType.CAPTURE;
    this.properties = {
      ...(captureRecord.capture_comment ? { comment: captureRecord.capture_comment } : {}),
      timestamp: timestamp,
      geometry: captureRecord.capture_location
        ? {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: [captureRecord.capture_location.longitude, captureRecord.capture_location.latitude]
                },
                properties: {}
              }
            ]
          }
        : null
    };

    // Create child features for markings and measurements
    const childFeatures: BioHubSubmissionFeature[] = [];

    // Add marking features
    if (captureRecord.markings && includeMarking) {
      for (const marking of captureRecord.markings) {
        childFeatures.push(new PostSurveyMarkingToBiohubObject(marking));
      }
    }

    // Add quantitative measurement features
    if (captureRecord.quantitative_measurements && includeMeasurement) {
      for (const measurement of captureRecord.quantitative_measurements) {
        childFeatures.push(new PostSurveyMeasurementToBiohubObject(measurement));
      }
    }

    // Note: qualitative_measurements could also be added here if needed

    // Add release feature as child of capture if release data exists
    if (captureRecord.release_date && includeRelease) {
      childFeatures.push(new PostSurveyReleaseToBiohubObject(captureRecord));
    }

    this.child_features = childFeatures;
  }
}

/**
 * Object to be sent to Biohub API for creating a release.
 *
 * @export
 * @class PostSurveyReleaseToBiohubObject
 * @implements {BioHubSubmissionFeature}
 */
export class PostSurveyReleaseToBiohubObject implements BioHubSubmissionFeature {
  id: string;
  type: string;
  properties: Record<string, unknown>;
  child_features: BioHubSubmissionFeature[];

  constructor(captureRecord: ICritterDetailed['captures'][0]) {
    defaultLog.debug({ label: 'PostSurveyReleaseToBiohubObject', message: 'params', captureRecord });

    // Combine release date and time into a single timestamp
    const timestamp = captureRecord.release_time
      ? `${captureRecord.release_date}T${captureRecord.release_time}`
      : captureRecord.release_date;

    this.id = crypto.randomUUID();
    this.type = BiohubFeatureType.RELEASE;
    this.properties = {
      ...(captureRecord.release_comment ? { comment: captureRecord.release_comment } : {}),
      timestamp: timestamp,
      geometry: captureRecord.release_location
        ? {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: [captureRecord.release_location.longitude, captureRecord.release_location.latitude]
                },
                properties: {}
              }
            ]
          }
        : null
    };
    this.child_features = [];
  }
}

/**
 * Object to be sent to Biohub API for creating a marking.
 *
 * @export
 * @class PostSurveyMarkingToBiohubObject
 * @implements {BioHubSubmissionFeature}
 */
export class PostSurveyMarkingToBiohubObject implements BioHubSubmissionFeature {
  id: string;
  type: string;
  properties: Record<string, unknown>;
  child_features: BioHubSubmissionFeature[];

  constructor(
    markingRecord: ICritterDetailed['captures'][0]['markings'][0] & { taxon_marking_body_location?: string }
  ) {
    defaultLog.debug({ label: 'PostSurveyMarkingToBiohubObject', message: 'params', markingRecord });

    this.id = crypto.randomUUID();
    this.type = BiohubFeatureType.MARKING;
    this.properties = {
      marking_type: markingRecord.marking_type,
      identifier: markingRecord.identifier,
      ...(markingRecord.primary_colour ? { primary_colour: markingRecord.primary_colour } : {}),
      ...(markingRecord.secondary_colour ? { secondary_colour: markingRecord.secondary_colour } : {}),
      body_position: markingRecord.taxon_marking_body_location || markingRecord.body_location,
      ...(markingRecord.comment ? { comment: markingRecord.comment } : {})
    };
    this.child_features = [];
  }
}

/**
 * Object to be sent to Biohub API for creating a measurement.
 *
 * @export
 * @class PostSurveyMeasurementToBiohubObject
 * @implements {BioHubSubmissionFeature}
 */
export class PostSurveyMeasurementToBiohubObject implements BioHubSubmissionFeature {
  id: string;
  type: string;
  properties: Record<string, unknown>;
  child_features: BioHubSubmissionFeature[];

  constructor(measurementRecord: MeasurementRecord) {
    defaultLog.debug({ label: 'PostSurveyMeasurementToBiohubObject', message: 'params', measurementRecord });

    this.id = crypto.randomUUID();
    this.type = BiohubFeatureType.MEASUREMENT;

    const description = measurementRecord.comment || measurementRecord.measurement_comment || null;

    this.properties = {
      measurement_type: measurementRecord.measurement_name || null,
      measurement_value: measurementRecord.value || null,
      ...(description ? { description } : {})
    };
    this.child_features = [];
  }
}

/**
 * Object to be sent to Biohub API for creating a mortality.
 *
 * @export
 * @class PostSurveyMortalityToBiohubObject
 * @implements {BioHubSubmissionFeature}
 */
export class PostSurveyMortalityToBiohubObject implements BioHubSubmissionFeature {
  id: string;
  type: string;
  properties: Record<string, unknown>;
  child_features: BioHubSubmissionFeature[];

  constructor(mortalityRecord: MortalityRecord) {
    defaultLog.debug({ label: 'PostSurveyMortalityToBiohubObject', message: 'params', mortalityRecord });

    this.id = crypto.randomUUID();
    this.type = BiohubFeatureType.MORTALITY;
    this.properties = {
      comment: mortalityRecord.mortality_comment || null,
      timestamp: mortalityRecord.mortality_timestamp,
      geometry: mortalityRecord.location
        ? {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: [mortalityRecord.location.longitude, mortalityRecord.location.latitude]
                },
                properties: {}
              }
            ]
          }
        : null,
      cause_of_death:
        mortalityRecord.proximate_cause_of_death?.cod_category && mortalityRecord.proximate_cause_of_death?.cod_reason
          ? `${mortalityRecord.proximate_cause_of_death.cod_category}: ${mortalityRecord.proximate_cause_of_death.cod_reason}`
          : mortalityRecord.proximate_cause_of_death?.cod_category ||
            mortalityRecord.proximate_cause_of_death?.cod_reason ||
            null
    };
    this.child_features = [];
  }
}

/**
 * Object to be sent to Biohub API for creating an animal.
 *
 * @export
 * @class PostSurveyAnimalToBiohubObject
 * @implements {BioHubSubmissionFeature}
 */
export class PostSurveyAnimalToBiohubObject implements BioHubSubmissionFeature {
  id: string;
  type: string;
  properties: Record<string, unknown>;
  child_features: BioHubSubmissionFeature[];

  constructor(
    animalRecord: ICritterDetailed & { mortality?: MortalityRecord | MortalityRecord[] },
    focalSpeciesData?: { focal_species: ITaxonomyWithEcologicalUnits[] },
    options: PostSurveyAnimalToBiohubOptions = {}
  ) {
    defaultLog.debug({ label: 'PostSurveyAnimalToBiohubObject', message: 'params', animalRecord });
    const {
      includeCapture = true,
      includeMortality = true,
      includeEcologicalUnit = true,
      includeMarking = true,
      includeMeasurement = true,
      includeRelease = true
    } = options;

    // Create capture features for each capture record
    const childFeatures: BioHubSubmissionFeature[] = [];

    if (animalRecord.captures && includeCapture) {
      for (const capture of animalRecord.captures) {
        childFeatures.push(
          new PostSurveyCaptureToBiohubObject(capture, {
            includeMarking,
            includeMeasurement,
            includeRelease
          })
        );
      }
    }

    // Create mortality features if mortality data exists
    // Note: The actual JSON data shows mortality as an array, but the interface shows it as a single object
    const mortalityArray = animalRecord.mortality || [];
    if (includeMortality && Array.isArray(mortalityArray)) {
      for (const mortality of mortalityArray) {
        childFeatures.push(new PostSurveyMortalityToBiohubObject(mortality));
      }
    } else if (includeMortality && animalRecord.mortality) {
      // Handle case where mortality is a single object (according to interface)
      childFeatures.push(new PostSurveyMortalityToBiohubObject(animalRecord.mortality));
    }

    // Create ecological unit features for this animal if focal species data exists
    if (includeEcologicalUnit && focalSpeciesData?.focal_species) {
      // Find the species that matches this animal's taxon
      const matchingSpecies = focalSpeciesData.focal_species.find(
        (species: ITaxonomyWithEcologicalUnits) => species.tsn === animalRecord.itis_tsn
      );

      if (matchingSpecies?.ecological_units && matchingSpecies.ecological_units.length > 0) {
        const ecologicalUnitFeatures = matchingSpecies.ecological_units.map(
          (ecologicalUnit) =>
            new PostEcologicalUnitToBiohubObject({
              ecological_unit_type: ecologicalUnit.critterbase_collection_category_id,
              ecological_unit_value: ecologicalUnit.critterbase_collection_unit_id
            })
        );
        childFeatures.push(...ecologicalUnitFeatures);
      }
    }

    this.id = crypto.randomUUID();
    this.type = BiohubFeatureType.ANIMAL;
    this.properties = {
      taxon_id: animalRecord.itis_tsn,
      animal_identifier: animalRecord.animal_id,
      description: animalRecord.critter_comment,
      sex: animalRecord.sex?.label || null
    };
    this.child_features = childFeatures;
  }
}

/**
 * Object to be sent to Biohub API for creating an artifact (for a SIMS attachment).
 *
 * @export
 * @class PostSurveyAttachmentsToBiohubObject
 * @implements {BioHubSubmissionFeature}
 */
export class PostSurveyAttachmentsToBiohubObject implements BioHubSubmissionFeature {
  id: string;
  type: string;
  properties: Record<string, unknown>;
  child_features: BioHubSubmissionFeature[];

  constructor(attachmentRecord: ISurveyAttachment) {
    defaultLog.debug({ label: 'PostSurveyAttachmentsToBiohubObject', message: 'params', attachmentRecord });

    this.id = crypto.randomUUID();
    this.type = BiohubFeatureType.FILE;
    this.properties = {
      artifact_key: attachmentRecord.key,
      filename: attachmentRecord.file_name,
      file_type: attachmentRecord.file_type,
      file_size: attachmentRecord.file_size,
      ...(attachmentRecord.title ? { title: attachmentRecord.title } : {}),
      ...(attachmentRecord.description ? { description: attachmentRecord.description } : {})
    };
    this.child_features = [];
  }
}

/**
 * Object to be sent to Biohub API for creating an artifact (for a SIMS report attachment).
 *
 * @export
 * @class PostSurveyReportAttachmentsToBiohubObject
 * @implements {BioHubSubmissionFeature}
 */
export class PostSurveyReportAttachmentsToBiohubObject implements BioHubSubmissionFeature {
  id: string;
  type: string;
  properties: Record<string, unknown>;
  child_features: BioHubSubmissionFeature[];

  constructor(reportAttachmentRecord: ISurveyReportAttachment) {
    defaultLog.debug({ label: 'PostSurveyReportAttachmentsToBiohubObject', message: 'params', reportAttachmentRecord });

    this.id = crypto.randomUUID();
    this.type = BiohubFeatureType.REPORT;
    this.properties = {
      artifact_key: reportAttachmentRecord.key,
      filename: reportAttachmentRecord.file_name,
      file_type: ATTACHMENT_TYPE.REPORT,
      file_size: reportAttachmentRecord.file_size,
      name: reportAttachmentRecord.title,
      description: reportAttachmentRecord.description,
      year: reportAttachmentRecord.year_published
    };
    this.child_features = [];
  }
}

/**
 * Object to be sent to Biohub API for creating a sampling site.
 *
 * @export
 * @class PostSurveySamplingSiteToBiohubObject
 * @implements {BioHubSubmissionFeature}
 */
export class PostSurveySamplingSiteToBiohubObject implements BioHubSubmissionFeature {
  id: string;
  type: string;
  properties: Record<string, unknown>;
  child_features: BioHubSubmissionFeature[];

  constructor(
    sampleSiteRecord: SampleSiteRecordWithGeojson,
    strata?: { name: string; description: string }[],
    options: PostSurveySamplingSiteToBiohubOptions = {}
  ) {
    defaultLog.debug({ label: 'PostSurveySamplingSiteToBiohubObject', message: 'params', sampleSiteRecord });
    const { includeBlock = true, includeStratum = true } = options;

    this.id = crypto.randomUUID();
    this.type = BiohubFeatureType.SAMPLE_SITE;
    this.properties = {
      name: sampleSiteRecord.name,
      description: sampleSiteRecord.description,
      geometry: sampleSiteRecord.geojson
        ? {
            type: 'FeatureCollection',
            features: [sampleSiteRecord.geojson]
          }
        : null
    };

    // Create stratum child features if strata data is available
    const stratumChildFeatures =
      strata && includeStratum ? strata.map((stratum) => new PostStratumToBiohubObject(stratum)) : [];

    // Create block child features if blocks data is available in the sample site record
    const blockChildFeatures =
      includeBlock && sampleSiteRecord.blocks
        ? sampleSiteRecord.blocks.map(
            (block: { name: string; description: string }) => new PostBlockToBiohubObject(block)
          )
        : [];

    this.child_features = [...stratumChildFeatures, ...blockChildFeatures];
  }
}

/**
 * Object to be sent to Biohub API for creating a sampling period.
 *
 * @export
 * @class PostSurveySamplingPeriodToBiohubObject
 * @implements {BioHubSubmissionFeature}
 */
export class PostSurveySamplingPeriodToBiohubObject implements BioHubSubmissionFeature {
  id: string;
  type: string;
  properties: Record<string, unknown>;
  child_features: BioHubSubmissionFeature[];

  constructor(samplingPeriodRecord: SurveySamplePeriodDetails) {
    defaultLog.debug({ label: 'PostSurveySamplingPeriodToBiohubObject', message: 'params', samplingPeriodRecord });

    this.id = crypto.randomUUID();
    this.type = BiohubFeatureType.SAMPLE_PERIOD;
    this.properties = {
      ...(samplingPeriodRecord.start_date
        ? {
            start_date: samplingPeriodRecord.start_time
              ? `${samplingPeriodRecord.start_date}T${samplingPeriodRecord.start_time}.000Z`
              : `${samplingPeriodRecord.start_date}T00:00:00.000Z`
          }
        : {}),
      ...(samplingPeriodRecord.end_date
        ? {
            end_date: samplingPeriodRecord.end_time
              ? `${samplingPeriodRecord.end_date}T${samplingPeriodRecord.end_time}.000Z`
              : `${samplingPeriodRecord.end_date}T23:59:59.000Z`
          }
        : {}),
      site_identifier: samplingPeriodRecord.survey_sample_site?.name || null,
      method_technique_id: samplingPeriodRecord.method_technique?.method_technique_id
        ? String(samplingPeriodRecord.method_technique.method_technique_id)
        : null
    };
    this.child_features = [];
  }
}

/**
 * Sampling Technique object to be sent to Biohub API for creating a survey sampling technique feature.
 *
 * @export
 * @class PostSampleTechniqueToBiohubObject
 * @implements {BioHubSubmissionFeature}
 */
export class PostSampleTechniqueToBiohubObject implements BioHubSubmissionFeature {
  id: string;
  type: string;
  properties: Record<string, unknown>;
  child_features: BioHubSubmissionFeature[];

  constructor(samplingTechniqueRecord: SampleTechniqueRecord, options: { codesetExportContext: CodesetExportContext }) {
    const { codesetExportContext } = options;
    this.id = crypto.randomUUID();
    this.type = BiohubFeatureType.SAMPLE_TECHNIQUE;

    // Use attractant IDs array from the database and convert to code format
    const attractantsArray = (samplingTechniqueRecord.attractant_ids || []).map((attractant) => ({
      attractant_name: buildCodesetReference('attractant_lookup', attractant.attractant_lookup_id, codesetExportContext)
    }));

    let method_attribute: string | null = null;
    let method_value: string | null = null;
    const firstAttrib = samplingTechniqueRecord.attribute_data?.find(
      (a) => a.attribute_header != null || a.attribute_value != null
    );
    if (firstAttrib) {
      if (firstAttrib.technique_attribute_qualitative_id != null) {
        method_attribute = `code::technique_attribute_qualitative::${firstAttrib.technique_attribute_qualitative_id}`;
      }
      if (firstAttrib.technique_attribute_qualitative_option_id != null) {
        method_value = `code::technique_attribute_qualitative_option::${firstAttrib.technique_attribute_qualitative_option_id}`;
      }
      if (firstAttrib.technique_attribute_quantitative_id != null) {
        method_attribute = `code::technique_attribute_quantitative::${firstAttrib.technique_attribute_quantitative_id}`;
      }
    }

    let vantage_method_attribute: string | null = null;
    let vantage_method_value: string | null = null;
    const firstVantage = samplingTechniqueRecord.vantage_data?.find(
      (v) => v.vantage_header != null || v.vantage_value != null
    );
    if (firstVantage) {
      if (firstVantage.vantage_category_id != null) {
        vantage_method_attribute = `code::vantage_category::${firstVantage.vantage_category_id}`;
      }
      if (firstVantage.vantage_id != null) {
        vantage_method_value = `code::vantage::${firstVantage.vantage_id}`;
      }
    }

    this.properties = {
      name: samplingTechniqueRecord.method_name,
      description: samplingTechniqueRecord.description,
      method_name: buildCodesetReference(
        'method_lookup',
        samplingTechniqueRecord.method_lookup_id,
        codesetExportContext
      ),
      attractant: attractantsArray,
      response_metric: buildCodesetReference(
        'method_response_metric',
        samplingTechniqueRecord.method_response_metric_id,
        codesetExportContext
      ),
      ...(samplingTechniqueRecord.distance_threshold
        ? { detect_distance: samplingTechniqueRecord.distance_threshold }
        : {}),
      method_attribute,
      method_value,
      vantage_method_attribute,
      vantage_method_value
    };

    this.child_features = [];
  }
}

/**
 * Object to be sent to Biohub API for creating a habitat feature.
 *
 * @export
 * @class PostSurveyHabitatFeatureToBiohubObject
 * @implements {BioHubSubmissionFeature}
 */
export class PostSurveyHabitatFeatureToBiohubObject implements BioHubSubmissionFeature {
  id: string;
  type: string;
  properties: Record<string, unknown>;
  child_features: BioHubSubmissionFeature[];

  constructor(
    habitatFeatureRecord: SurveyHabitatFeatureWithTaxonsAndSampling,
    options: { codesetExportContext: CodesetExportContext }
  ) {
    defaultLog.debug({ label: 'PostSurveyHabitatFeatureToBiohubObject', message: 'params', habitatFeatureRecord });
    const { codesetExportContext } = options;

    // Combine date and time into a single timestamp
    let timestamp: string | null = null;
    if (habitatFeatureRecord.observed_time) {
      timestamp = `${habitatFeatureRecord.observed_date}T${habitatFeatureRecord.observed_time}Z`;
    } else if (habitatFeatureRecord.observed_date) {
      timestamp = `${habitatFeatureRecord.observed_date}T00:00:00.000Z`;
    }

    // Create associated species array from focal species
    const associatedSpeciesArray =
      habitatFeatureRecord.survey_habitat_feature_taxons?.map((species: { itis_tsn: number }) => ({
        taxon_id: species.itis_tsn
      })) || [];

    this.id = crypto.randomUUID();
    this.type = BiohubFeatureType.HABITAT_FEATURE;
    this.properties = {
      name: buildCodesetReference(
        'habitat_feature_type',
        habitatFeatureRecord.habitat_feature_type_id,
        codesetExportContext
      ),
      count: habitatFeatureRecord.count,
      timestamp: timestamp,
      ...(associatedSpeciesArray.length > 0 ? { associated_species: associatedSpeciesArray } : {}),
      geometry:
        habitatFeatureRecord.latitude && habitatFeatureRecord.longitude
          ? {
              type: 'FeatureCollection',
              features: [
                {
                  type: 'Feature',
                  geometry: {
                    type: 'Point',
                    coordinates: [habitatFeatureRecord.longitude, habitatFeatureRecord.latitude]
                  },
                  properties: {}
                }
              ]
            }
          : null
    };
    this.child_features = [];
  }
}

/**
 * Object to be sent to Biohub API for creating a telemetry device.
 *
 * @export
 * @class PostTelemetryDeviceToBiohubObject
 * @implements {BioHubSubmissionFeature}
 */
export class PostTelemetryDeviceToBiohubObject implements BioHubSubmissionFeature {
  id: string;
  type: string;
  properties: Record<string, unknown>;
  child_features: BioHubSubmissionFeature[];

  constructor(deviceRecord: DeviceRecord, options: { codesetExportContext: CodesetExportContext }) {
    defaultLog.debug({ label: 'PostTelemetryDeviceToBiohubObject', message: 'params', deviceRecord });
    const { codesetExportContext } = options;

    this.id = crypto.randomUUID();
    this.type = BiohubFeatureType.TELEMETRY_DEVICE;
    this.properties = {
      device_manufacturer: buildCodesetReference('device_make', deviceRecord.device_make_id, codesetExportContext),
      device_model: deviceRecord.model || null,
      description: deviceRecord.comment || null,
      serial_number: deviceRecord.serial
    };
    this.child_features = [];
  }
}

/**
 * Object to be sent to Biohub API for creating a telemetry deployment.
 *
 * @export
 * @class PostTelemetryDeploymentToBiohubObject
 * @implements {BioHubSubmissionFeature}
 */
export interface PostTelemetryDeploymentToBiohubOptions {
  telemetry?: Telemetry[];
  animalRecords?: ICritterDetailed[];
  codesetExportContext: CodesetExportContext;
  includeTelemetry?: boolean;
  includeTelemetryFrequency?: boolean;
}

export class PostTelemetryDeploymentToBiohubObject implements BioHubSubmissionFeature {
  id: string;
  type: string;
  properties: Record<string, unknown>;
  child_features: BioHubSubmissionFeature[];

  constructor(deploymentRecord: ExtendedDeploymentRecord, options: PostTelemetryDeploymentToBiohubOptions) {
    defaultLog.debug({ label: 'PostTelemetryDeploymentToBiohubObject', message: 'params', deploymentRecord });

    const {
      telemetry,
      animalRecords,
      codesetExportContext,
      includeTelemetry = true,
      includeTelemetryFrequency = true
    } = options;

    // Find the matching animal record to get the animal_id
    const matchingAnimal = animalRecords?.find(
      (animal) => animal.critter_id === deploymentRecord.critterbase_critter_id
    );

    this.id = crypto.randomUUID();
    this.type = BiohubFeatureType.TELEMETRY_DEPLOYMENT;
    this.properties = {
      animal_identifier: matchingAnimal?.animal_id || null,
      device_key: deploymentRecord.device_key,
      ...(deploymentRecord.attachment_start_date ? { start_date: deploymentRecord.attachment_start_date } : {}),
      ...(deploymentRecord.attachment_end_date ? { end_date: deploymentRecord.attachment_end_date } : {})
    };

    // Create child features for this deployment
    this.child_features = [];

    // Add telemetry child features
    if (telemetry && includeTelemetry) {
      const telemetryFeatures = telemetry
        .filter((telemetryRecord) => {
          // Filter telemetry records that belong to this deployment
          return telemetryRecord.deployment_id === deploymentRecord.deployment_id;
        })
        .map((telemetryRecord) => new PostTelemetryToBiohubObject(telemetryRecord));

      this.child_features.push(...telemetryFeatures);
    }

    // Add frequency child feature if frequency data exists
    if (
      includeTelemetryFrequency &&
      (deploymentRecord.frequency != null || deploymentRecord.frequency_unit_id != null)
    ) {
      this.child_features.push(
        new PostTelemetryFrequencyToBiohubObject(deploymentRecord.frequency, deploymentRecord.frequency_unit_id, {
          codesetExportContext
        })
      );
    }
  }
}

/**
 * Telemetry Frequency object to be sent to Biohub API for creating a telemetry frequency feature.
 *
 * @export
 * @class PostTelemetryFrequencyToBiohubObject
 * @implements {BioHubSubmissionFeature}
 */
export class PostTelemetryFrequencyToBiohubObject implements BioHubSubmissionFeature {
  id: string;
  type: string;
  properties: Record<string, unknown>;
  child_features: BioHubSubmissionFeature[];

  constructor(
    frequency: number | null,
    frequencyUnitId: number | null,
    options: { codesetExportContext: CodesetExportContext }
  ) {
    const { codesetExportContext } = options;
    this.id = crypto.randomUUID();
    this.type = BiohubFeatureType.TELEMETRY_FREQUENCY;

    // Only include properties if they are not null, using code format
    this.properties = {};
    if (frequency != null) {
      this.properties.frequency = frequency;
    }
    if (frequencyUnitId != null) {
      this.properties.frequency_unit = buildCodesetReference('frequency_unit', frequencyUnitId, codesetExportContext);
    }

    this.child_features = [];
  }
}

/**
 * Telemetry object to be sent to Biohub API for creating a survey telemetry feature.
 *
 * @export
 * @class PostTelemetryToBiohubObject
 * @implements {BioHubSubmissionFeature}
 */
export class PostTelemetryToBiohubObject implements BioHubSubmissionFeature {
  id: string;
  type: string;
  properties: Record<string, unknown>;
  child_features: BioHubSubmissionFeature[];

  constructor(telemetryRecord: Telemetry) {
    this.id = crypto.randomUUID();
    this.type = BiohubFeatureType.TELEMETRY;
    this.properties = {
      timestamp: telemetryRecord.acquisition_date,
      geometry:
        telemetryRecord.longitude && telemetryRecord.latitude
          ? {
              type: 'FeatureCollection',
              features: [
                {
                  type: 'Feature',
                  geometry: {
                    type: 'Point',
                    coordinates: [telemetryRecord.longitude, telemetryRecord.latitude]
                  },
                  properties: {}
                }
              ]
            }
          : null,
      ...(telemetryRecord.elevation ? { elevation: telemetryRecord.elevation } : {}),
      ...(telemetryRecord.dop ? { dop: telemetryRecord.dop } : {})
    };
    this.child_features = [];
  }
}

/**
 * Object to be sent to Biohub API for creating a study area.
 *
 * @export
 * @class PostStudyAreaToBiohubObject
 * @implements {BioHubSubmissionFeature}
 */
export class PostStudyAreaToBiohubObject implements BioHubSubmissionFeature {
  id: string;
  type: string;
  properties: Record<string, unknown>;
  child_features: BioHubSubmissionFeature[];

  constructor(surveyLocation: SurveyLocationRecord[], surveyName: string) {
    this.id = crypto.randomUUID();
    this.type = BiohubFeatureType.STUDY_AREA;

    // Extract geometry from survey locations
    const geometryFeatures = surveyLocation.flatMap((location) => location.geojson as Feature[]);

    this.properties = {
      name: `${surveyName} Study Area`,
      description: `Study area for ${surveyName}`,
      geometry: {
        type: 'FeatureCollection',
        features: geometryFeatures
      }
    };
    this.child_features = [];
  }
}

/**
 * Object to be sent to Biohub API for creating an ecological unit.
 *
 * @export
 * @class PostEcologicalUnitToBiohubObject
 * @implements {BioHubSubmissionFeature}
 */
export class PostEcologicalUnitToBiohubObject implements BioHubSubmissionFeature {
  id: string;
  type: string;
  properties: Record<string, unknown>;
  child_features: BioHubSubmissionFeature[];

  constructor(ecologicalUnitData: { ecological_unit_type: string; ecological_unit_value: string }) {
    defaultLog.debug({ label: 'PostEcologicalUnitToBiohubObject', message: 'params', ecologicalUnitData });

    this.id = crypto.randomUUID();
    this.type = BiohubFeatureType.ECOLOGICAL_UNIT;
    this.properties = {
      ecological_unit_type: ecologicalUnitData.ecological_unit_type,
      ecological_unit_value: ecologicalUnitData.ecological_unit_value
    };
    this.child_features = [];
  }
}

/**
 * Object to be sent to Biohub API for creating a stratum.
 *
 * @export
 * @class PostStratumToBiohubObject
 * @implements {BioHubSubmissionFeature}
 */
export class PostStratumToBiohubObject implements BioHubSubmissionFeature {
  id: string;
  type: string;
  properties: Record<string, unknown>;
  child_features: BioHubSubmissionFeature[];

  constructor(stratumData: { name: string; description: string }) {
    defaultLog.debug({ label: 'PostStratumToBiohubObject', message: 'params', stratumData });

    this.id = crypto.randomUUID();
    this.type = BiohubFeatureType.STRATUM;
    this.properties = {
      name: stratumData.name,
      description: stratumData.description
    };
    this.child_features = [];
  }
}

/**
 * @class PostBlockToBiohubObject
 * @implements {BioHubSubmissionFeature}
 */
export class PostBlockToBiohubObject implements BioHubSubmissionFeature {
  id: string;
  type: string;
  properties: Record<string, unknown>;
  child_features: BioHubSubmissionFeature[];

  constructor(blockData: { name: string; description: string }) {
    defaultLog.debug({ label: 'PostBlockToBiohubObject', message: 'params', blockData });

    this.id = crypto.randomUUID();
    this.type = BiohubFeatureType.BLOCK;
    this.properties = {
      name: blockData.name,
      description: blockData.description
    };
    this.child_features = [];
  }
}

/**
 * Object to be sent to Biohub API for creating a codeset containing all codetable categories.
 *
 * @export
 * @class PostCodesetToBiohubObject
 * @implements {BioHubSubmissionFeature}
 */
export class PostCodesetToBiohubObject implements BioHubSubmissionFeature {
  id: string;
  type: string;
  properties: Record<string, unknown>;
  child_features: BioHubSubmissionFeature[];

  constructor(codesetCategories: CodesetCategory[], exportContext: CodesetExportContext) {
    defaultLog.debug({
      label: 'PostCodesetToBiohubObject',
      message: 'params',
      categoryCount: codesetCategories.length
    });

    this.id = crypto.randomUUID();
    this.type = BiohubFeatureType.CODESET;

    this.properties = buildCodesetProperties(codesetCategories, exportContext);
    this.child_features = [];
  }
}

/**
 * Object to be sent to Biohub API for creating a survey.
 *
 * @export
 * @class PostSurveyToBiohubObject
 * @implements {BioHubSubmissionFeature}
 */
export class PostSurveyToBiohubObject implements BioHubSubmissionFeature {
  id: string;
  type: string;
  properties: Record<string, unknown>;
  child_features: BioHubSubmissionFeature[];

  constructor(
    surveyData: GetSurveyData,
    surveyPurposeAndMethodologyData: GetSurveyPurposeAndMethodologyData,
    observationRecords: SurveyObservationRecord[],
    _surveyGeometry: FeatureCollection,
    surveyAttachments: ISurveyAttachment[],
    surveyReports: ISurveyReportAttachment[],
    options: PostSurveyToBiohubOptions = {}
  ) {
    defaultLog.debug({ label: 'PostSurveyToBiohubObject', message: 'params', surveyData });

    const {
      animalRecords = [],
      environmentDefinitions,
      measurementDefinitions,
      samplingSites,
      samplingPeriods,
      habitatFeatures,
      telemetryDevices,
      telemetryDeployments,
      telemetry,
      samplingTechniques,
      partnerships,
      focalSpecies,
      surveyLocation,
      firstNations,
      strata,
      siteSelectionStrategies,
      codesetCategories,
      includeFeatureTypes
    } = options;

    const isFeatureIncluded = (featureType: BiohubFeatureType) => {
      return includeFeatureTypes ? includeFeatureTypes.has(featureType) : true;
    };

    const codesetExportContext = buildCodesetExportContext(codesetCategories ?? []);

    const observationFeatures = observationRecords.map(
      (observation) =>
        new PostSurveyObservationToBiohubObject(observation, {
          environmentDefinitions,
          measurementDefinitions,
          codesetExportContext
        })
    );

    const attachmentFeatures = surveyAttachments.map(
      (attachment) => new PostSurveyAttachmentsToBiohubObject(attachment)
    );

    const reportAttachmentFeatures = surveyReports.map(
      (attachment) => new PostSurveyReportAttachmentsToBiohubObject(attachment)
    );

    const animalFeatures = animalRecords.map(
      (animal) =>
        new PostSurveyAnimalToBiohubObject(animal, focalSpecies, {
          includeCapture: isFeatureIncluded(BiohubFeatureType.CAPTURE),
          includeMortality: isFeatureIncluded(BiohubFeatureType.MORTALITY),
          includeEcologicalUnit: isFeatureIncluded(BiohubFeatureType.ECOLOGICAL_UNIT),
          includeMarking: isFeatureIncluded(BiohubFeatureType.MARKING),
          includeMeasurement: isFeatureIncluded(BiohubFeatureType.MEASUREMENT),
          includeRelease: isFeatureIncluded(BiohubFeatureType.RELEASE)
        })
    );

    // Create sampling features
    const samplingSiteFeatures = mapOrEmpty(
      samplingSites,
      (samplingSite) =>
        new PostSurveySamplingSiteToBiohubObject(samplingSite, strata, {
          includeBlock: isFeatureIncluded(BiohubFeatureType.BLOCK),
          includeStratum: isFeatureIncluded(BiohubFeatureType.STRATUM)
        })
    );

    const samplingPeriodFeatures = mapOrEmpty(
      samplingPeriods,
      (samplingPeriod) => new PostSurveySamplingPeriodToBiohubObject(samplingPeriod)
    );

    const samplingTechniqueFeatures = mapOrEmpty(
      samplingTechniques,
      (samplingTechnique) => new PostSampleTechniqueToBiohubObject(samplingTechnique, { codesetExportContext })
    );

    // Create habitat features
    const habitatFeatureFeatures = mapOrEmpty(
      habitatFeatures,
      (habitatFeature) => new PostSurveyHabitatFeatureToBiohubObject(habitatFeature, { codesetExportContext })
    );

    // Create telemetry features
    const telemetryDeviceFeatures = mapOrEmpty(
      telemetryDevices,
      (device) => new PostTelemetryDeviceToBiohubObject(device, { codesetExportContext })
    );

    const telemetryDeploymentFeatures = mapOrEmpty(
      telemetryDeployments,
      (deployment) =>
        new PostTelemetryDeploymentToBiohubObject(deployment, {
          telemetry,
          animalRecords,
          codesetExportContext,
          includeTelemetry: isFeatureIncluded(BiohubFeatureType.TELEMETRY),
          includeTelemetryFrequency: isFeatureIncluded(BiohubFeatureType.TELEMETRY_FREQUENCY)
        })
    );

    // Create study area feature if survey location data is available
    const studyAreaFeature = createStudyAreaFeature(surveyLocation, surveyData.survey_name);

    const partnershipsValue = buildPartnershipsValue(partnerships, firstNations, { codesetExportContext });

    // Create focal species array from focal species
    const focalSpeciesArray = buildFocalSpeciesArray(focalSpecies);

    // Create collected data array from survey types
    const collectedDataArray =
      surveyData.survey_types.map((survey_type_id) => ({ survey_type_id: String(survey_type_id) })) || [];

    // Create stratum features
    const stratumFeatures = mapOrEmpty(strata, (stratum) => new PostStratumToBiohubObject(stratum));

    // Create site selection strategies array
    const siteSelectionStrategiesArray = buildSiteSelectionStrategiesArray(siteSelectionStrategies, {
      codesetExportContext
    });

    // Create codeset feature if codeset categories are available
    const codesetFeature = codesetCategories?.length
      ? [new PostCodesetToBiohubObject(codesetCategories, codesetExportContext)]
      : [];

    this.id = crypto.randomUUID();
    this.type = BiohubFeatureType.DATASET;
    this.properties = {
      survey_id: surveyData.id,
      project_id: surveyData.project_id,
      name: surveyData.survey_name,
      ...buildSurveyDateProperties(surveyData),
      collected_data: collectedDataArray,
      objectives: surveyPurposeAndMethodologyData.additional_details,
      ...(partnershipsValue
        ? {
            indigenous_partnerships: partnershipsValue.indigenous_partnerships,
            stakeholder_partnerships: partnershipsValue.stakeholder_partnerships
          }
        : {}),
      ...buildOptionalArrayProperty(focalSpeciesArray, 'focal_species'),
      ...buildOptionalArrayProperty(siteSelectionStrategiesArray, 'site_select_strategy')
    };
    this.child_features = [
      ...(isFeatureIncluded(BiohubFeatureType.OBSERVATION) ? observationFeatures : []),
      ...(isFeatureIncluded(BiohubFeatureType.REPORT) ? reportAttachmentFeatures : []),
      ...(isFeatureIncluded(BiohubFeatureType.FILE) ? attachmentFeatures : []),
      ...(isFeatureIncluded(BiohubFeatureType.ANIMAL) ? animalFeatures : []),
      ...(isFeatureIncluded(BiohubFeatureType.SAMPLE_SITE) ? samplingSiteFeatures : []),
      ...(isFeatureIncluded(BiohubFeatureType.SAMPLE_PERIOD) ? samplingPeriodFeatures : []),
      ...(isFeatureIncluded(BiohubFeatureType.SAMPLE_TECHNIQUE) ? samplingTechniqueFeatures : []),
      ...(isFeatureIncluded(BiohubFeatureType.HABITAT_FEATURE) ? habitatFeatureFeatures : []),
      ...(isFeatureIncluded(BiohubFeatureType.TELEMETRY_DEVICE) ? telemetryDeviceFeatures : []),
      ...(isFeatureIncluded(BiohubFeatureType.TELEMETRY_DEPLOYMENT) ? telemetryDeploymentFeatures : []),
      ...(isFeatureIncluded(BiohubFeatureType.STUDY_AREA) ? studyAreaFeature : []),
      ...(isFeatureIncluded(BiohubFeatureType.STRATUM) ? stratumFeatures : []),
      ...codesetFeature
    ];
  }
}

export class PostSurveySubmissionToBioHubObject implements BioHubSubmission {
  id: string;
  name: string;
  description: string;
  comment: string;
  content: BioHubSubmissionFeature;

  constructor(
    surveyData: GetSurveyData,
    GetSurveyPurposeAndMethodologyData: GetSurveyPurposeAndMethodologyData,
    observationRecords: SurveyObservationRecord[],
    submissionData: PostSurveySubmissionInputData,
    options: PostSurveySubmissionOptions = {}
  ) {
    defaultLog.debug({ label: 'PostSurveySubmissionToBioHubObject' });

    const { surveyGeometry, surveyAttachments, surveyReports, submissionComment } = submissionData;

    const {
      animalRecords = [],
      environmentDefinitions,
      measurementDefinitions,
      samplingSites,
      samplingPeriods,
      samplingTechniques,
      habitatFeatures,
      telemetryDevices,
      telemetryDeployments,
      telemetry,
      partnerships,
      focalSpecies,
      surveyLocation,
      firstNations,
      strata,
      siteSelectionStrategies,
      codesetCategories
    } = options;

    this.id = crypto.randomUUID();
    this.name = surveyData.survey_name;
    this.description = GetSurveyPurposeAndMethodologyData.additional_details;
    this.comment = submissionComment;
    this.content = new PostSurveyToBiohubObject(
      surveyData,
      GetSurveyPurposeAndMethodologyData,
      observationRecords,
      surveyGeometry,
      surveyAttachments,
      surveyReports,
      {
        animalRecords,
        environmentDefinitions,
        measurementDefinitions,
        samplingSites,
        samplingPeriods,
        habitatFeatures,
        telemetryDevices,
        telemetryDeployments,
        telemetry,
        samplingTechniques,
        partnerships,
        focalSpecies,
        surveyLocation,
        firstNations,
        strata,
        siteSelectionStrategies,
        codesetCategories,
        includeFeatureTypes: options.includeFeatureTypes
      }
    );

    defaultLog.debug({
      label: 'PostSurveySubmissionToBioHubObject',
      message: 'constructed',
      data: this
    });
  }
}

function mapOrEmpty<T, R>(items: T[] | undefined, mapper: (item: T) => R): R[] {
  if (!items || items.length === 0) {
    return [];
  }

  return items.map(mapper);
}

function createStudyAreaFeature(
  surveyLocation: SurveyLocationRecord[] | undefined,
  surveyName: string
): BioHubSubmissionFeature[] {
  if (!surveyLocation || surveyLocation.length === 0) {
    return [];
  }

  return [new PostStudyAreaToBiohubObject(surveyLocation, surveyName)];
}

function buildPartnershipsValue(
  partnerships: { indigenous_partnerships: number[]; stakeholder_partnerships: string[] } | undefined,
  _firstNations: { id: number; name: string }[] | undefined,
  options: { codesetExportContext: CodesetExportContext }
): {
  indigenous_partnerships: { name: string }[];
  stakeholder_partnerships: { name: string }[];
} | null {
  if (!partnerships) {
    return null;
  }

  const { codesetExportContext } = options;
  const indigenousPartnerships = (partnerships.indigenous_partnerships || []).map((id) => ({
    name: buildCodesetReference('first_nations', id, codesetExportContext)
  }));
  const stakeholderPartnerships = (partnerships.stakeholder_partnerships || []).map((name) => ({
    name: name
  }));

  if (indigenousPartnerships.length === 0 && stakeholderPartnerships.length === 0) {
    return null;
  }

  return {
    indigenous_partnerships: indigenousPartnerships,
    stakeholder_partnerships: stakeholderPartnerships
  };
}

function buildFocalSpeciesArray(focalSpecies?: { focal_species: ITaxonomyWithEcologicalUnits[] }): {
  taxon_id: number;
}[] {
  return focalSpecies?.focal_species?.map((species) => ({ taxon_id: species.tsn })) ?? [];
}

function buildSiteSelectionStrategiesArray(
  siteSelectionStrategies: number[] | undefined,
  options: { codesetExportContext: CodesetExportContext }
): { strategy: string }[] {
  const { codesetExportContext } = options;
  return (siteSelectionStrategies ?? []).map((site_strategy_id) => ({
    strategy: buildCodesetReference('site_strategy', site_strategy_id, codesetExportContext)
  }));
}

function buildOptionalArrayProperty<T>(items: T[], key: string): Record<string, T[]> {
  return items.length > 0 ? { [key]: items } : {};
}

function buildSurveyDateProperties(surveyData: GetSurveyData): Record<string, string> {
  const props: Record<string, string> = {};

  if (surveyData.start_date) {
    props.start_date = surveyData.start_date;
  }

  if (surveyData.end_date) {
    props.end_date = surveyData.end_date;
  }

  return props;
}

/**
 * Builds a shared export context for codeset categories, including alias mappings for category and
 * code keys used in BioHub code references and codeset JSON. The context should be built once per
 * export and passed to all helpers that emit code references or codeset JSON.
 *
 * @param {CodesetCategory[]} codesetCategories - SIMS codeset categories (name, description, codes)
 * @return {*}  {CodesetExportContext} Context with category/code alias maps
 */
export function buildCodesetExportContext(codesetCategories: CodesetCategory[]): CodesetExportContext {
  const context: CodesetExportContext = {
    categoryAliasByName: {},
    categoryNameByAlias: {},
    codeAliasByCategoryAndId: {},
    codeIdByCategoryAndAlias: {}
  };

  codesetCategories.forEach((category) => {
    const categoryKey = category.key;
    context.categoryAliasByName[category.key] = categoryKey;
    context.categoryNameByAlias[categoryKey] = category.key;

    const codeAliasById: Record<string, string> = {};
    const codeIdByAlias: Record<string, string> = {};

    category.codes.forEach((code) => {
      const codeKey = String(code.key);
      codeAliasById[codeKey] = codeKey;
      codeIdByAlias[codeKey] = codeKey;
    });

    context.codeAliasByCategoryAndId[category.key] = codeAliasById;
    context.codeIdByCategoryAndAlias[category.key] = codeIdByAlias;
  });

  return context;
}

/**
 * Builds the `codes/codeset.json` payload from SIMS codeset categories using the provided export context.
 * The result is a single object keyed by category keys (e.g. `life_stage`), with each category and code
 * object containing key, label, description, and external_id per the BioHub spec.
 *
 * @param {CodesetCategory[]} codesetCategories - SIMS codeset categories to serialize
 * @param {CodesetExportContext} context - Shared export context from buildCodesetExportContext
 * @return {*}  {Record<string, unknown>} Object suitable for codes/codeset.json in the tarball
 */
function buildCodesetProperties(
  codesetCategories: CodesetCategory[],
  context: CodesetExportContext
): Record<string, unknown> {
  const categories: Record<
    string,
    {
      key: string;
      label: string;
      description: string | null;
      external_id: string | null;
      codes: Record<
        string,
        {
          key: string;
          label: string;
          description: string | null;
          external_id: string | null;
        }
      >;
    }
  > = {};

  for (const category of codesetCategories) {
    const categoryKey = context.categoryAliasByName[category.key];

    const codes: Record<
      string,
      {
        key: string;
        label: string;
        description: string | null;
        external_id: string | null;
      }
    > = {};

    category.codes.forEach((code) => {
      const codeKey = context.codeAliasByCategoryAndId[category.key]?.[String(code.key)];
      if (!codeKey) {
        return;
      }
      codes[codeKey] = {
        key: codeKey,
        label: code.label,
        description: code.description,
        external_id: code.external_id
      };
    });

    categories[categoryKey] = {
      key: categoryKey,
      label: category.label,
      description: category.description,
      external_id: null,
      codes
    };
  }

  return categories;
}

/**
 * Builds a code reference string (e.g. `code::life_stage::juvenile`) using the alias mappings in the
 * export context. Returns the canonical form `code::<category>::<id>` when the category or code is
 * not present in the context.
 *
 * @param {string} categoryName - Codeset category name (e.g. 'observation_sign', 'site_strategy')
 * @param {string | number} codeId - Code identifier from SIMS
 * @param {CodesetExportContext} context - Shared export context from buildCodesetExportContext
 * @return {*}  {string} Code reference or canonical code reference string
 */
function buildCodesetReference(
  categoryName: string,
  codeId: string | number,
  context: CodesetExportContext | undefined
): string {
  const canonical = `code::${categoryName}::${codeId}`;

  if (!context) {
    return canonical;
  }

  const categoryAlias = context.categoryAliasByName[categoryName];
  if (!categoryAlias) {
    return canonical;
  }

  const codeAlias = context.codeAliasByCategoryAndId[categoryName]?.[String(codeId)];
  if (!codeAlias) {
    return canonical;
  }

  return `code::${categoryAlias}::${codeAlias}`;
}

export enum BiohubFeatureType {
  ANIMAL = 'animal',
  BLOCK = 'block',
  CAPTURE = 'capture',
  CODESET = 'codeset',
  DATASET = 'dataset',
  ECOLOGICAL_UNIT = 'ecological_unit',
  FILE = 'file',
  HABITAT_FEATURE = 'habitat_feature',
  MARKING = 'marking',
  MEASUREMENT = 'measurement',
  MORTALITY = 'mortality',
  OBSERVATION = 'species_observation',
  RELEASE = 'release',
  REPORT = 'report',
  SAMPLE_PERIOD = 'sample_period',
  SAMPLE_SITE = 'sample_site',
  SAMPLE_TECHNIQUE = 'sample_technique',
  STRATUM = 'stratum',
  STUDY_AREA = 'study_area',
  TELEMETRY = 'telemetry',
  TELEMETRY_DEPLOYMENT = 'telemetry_deployment',
  TELEMETRY_FREQUENCY = 'telemetry_frequency',
  TELEMETRY_DEVICE = 'telemetry_device'
}

export const PUBLISHABLE_FEATURE_TYPES = [
  BiohubFeatureType.ANIMAL,
  BiohubFeatureType.BLOCK,
  BiohubFeatureType.CAPTURE,
  BiohubFeatureType.ECOLOGICAL_UNIT,
  BiohubFeatureType.FILE,
  BiohubFeatureType.HABITAT_FEATURE,
  BiohubFeatureType.MARKING,
  BiohubFeatureType.MEASUREMENT,
  BiohubFeatureType.MORTALITY,
  BiohubFeatureType.OBSERVATION,
  BiohubFeatureType.RELEASE,
  BiohubFeatureType.REPORT,
  BiohubFeatureType.SAMPLE_SITE,
  BiohubFeatureType.SAMPLE_PERIOD,
  BiohubFeatureType.SAMPLE_TECHNIQUE,
  BiohubFeatureType.STRATUM,
  BiohubFeatureType.STUDY_AREA,
  BiohubFeatureType.TELEMETRY,
  BiohubFeatureType.TELEMETRY_DEVICE,
  BiohubFeatureType.TELEMETRY_DEPLOYMENT,
  BiohubFeatureType.TELEMETRY_FREQUENCY
] as const;

export const PUBLISHABLE_FEATURE_TYPE_PARENTS: Partial<Record<BiohubFeatureType, BiohubFeatureType[]>> = {
  [BiohubFeatureType.BLOCK]: [BiohubFeatureType.SAMPLE_SITE],
  [BiohubFeatureType.CAPTURE]: [BiohubFeatureType.ANIMAL],
  [BiohubFeatureType.ECOLOGICAL_UNIT]: [BiohubFeatureType.ANIMAL],
  [BiohubFeatureType.MARKING]: [BiohubFeatureType.CAPTURE],
  [BiohubFeatureType.MEASUREMENT]: [BiohubFeatureType.CAPTURE],
  [BiohubFeatureType.MORTALITY]: [BiohubFeatureType.ANIMAL],
  [BiohubFeatureType.RELEASE]: [BiohubFeatureType.CAPTURE],
  [BiohubFeatureType.SAMPLE_PERIOD]: [BiohubFeatureType.SAMPLE_SITE],
  [BiohubFeatureType.SAMPLE_TECHNIQUE]: [BiohubFeatureType.SAMPLE_SITE],
  [BiohubFeatureType.STRATUM]: [BiohubFeatureType.SAMPLE_SITE],
  [BiohubFeatureType.TELEMETRY_DEPLOYMENT]: [BiohubFeatureType.TELEMETRY_DEVICE],
  [BiohubFeatureType.TELEMETRY]: [BiohubFeatureType.TELEMETRY_DEPLOYMENT],
  [BiohubFeatureType.TELEMETRY_FREQUENCY]: [BiohubFeatureType.TELEMETRY_DEPLOYMENT]
};
