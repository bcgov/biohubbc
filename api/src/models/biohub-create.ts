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
import { SampleSiteRecordExtendedNonSpatial } from '../repositories/sample-site-repository/sample-site-repository';
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
interface SampleSiteRecordWithGeojson extends SampleSiteRecordExtendedNonSpatial {
  geojson: Feature;
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
  id: string;
  name: string;
  description: string | null;
}

export interface CodesetCategory {
  name: string;
  description: string | null;
  codes: CodesetCode[];
}

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
}

type PostSurveySubmissionOptions = PostSurveyToBiohubOptions;
export interface BioHubSubmissionFeature {
  id: string;
  type: string;
  properties: Record<string, unknown>;
  child_features: BioHubSubmissionFeature[];
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
    environmentDefinitions?: {
      qualitative_environments: QualitativeEnvironmentTypeDefinition[];
      quantitative_environments: QuantitativeEnvironmentTypeDefinition[];
    },
    measurementDefinitions?: {
      qualitative_measurements: CBQualitativeMeasurementTypeDefinition[];
      quantitative_measurements: CBQuantitativeMeasurementTypeDefinition[];
    }
  ) {
    defaultLog.debug({ label: 'PostSurveyObservationToBiohubObject', message: 'params', observationRecord });

    // Combine date and time into a single timestamp
    const timestamp = observationRecord.observation_time
      ? `${observationRecord.observation_date}T${observationRecord.observation_time}`
      : observationRecord.observation_date;

    this.id = crypto.randomUUID();
    this.type = BiohubFeatureType.OBSERVATION;
    // Single-value properties (first item only) collapsed from observation_environmental_condition children
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

    // Single-value properties (first subcount / first measurement only) collapsed from observation_subcount + observation_subcount_measurement
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
        ? `code::observation_sign::${observationRecord.observation_sign_id}`
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

  constructor(captureRecord: ICritterDetailed['captures'][0]) {
    defaultLog.debug({ label: 'PostSurveyCaptureToBiohubObject', message: 'params', captureRecord });

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
    if (captureRecord.markings) {
      for (const marking of captureRecord.markings) {
        childFeatures.push(new PostSurveyMarkingToBiohubObject(marking));
      }
    }

    // Add quantitative measurement features
    if (captureRecord.quantitative_measurements) {
      for (const measurement of captureRecord.quantitative_measurements) {
        childFeatures.push(new PostSurveyMeasurementToBiohubObject(measurement));
      }
    }

    // Note: qualitative_measurements could also be added here if needed

    // Add release feature as child of capture if release data exists
    if (captureRecord.release_date) {
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
    focalSpeciesData?: { focal_species: ITaxonomyWithEcologicalUnits[] }
  ) {
    defaultLog.debug({ label: 'PostSurveyAnimalToBiohubObject', message: 'params', animalRecord });

    // Create capture features for each capture record
    const childFeatures: BioHubSubmissionFeature[] = [];

    if (animalRecord.captures) {
      for (const capture of animalRecord.captures) {
        // Always create capture feature (release will be a child of capture)
        childFeatures.push(new PostSurveyCaptureToBiohubObject(capture));
      }
    }

    // Create mortality features if mortality data exists
    // Note: The actual JSON data shows mortality as an array, but the interface shows it as a single object
    const mortalityArray = animalRecord.mortality || [];
    if (Array.isArray(mortalityArray)) {
      for (const mortality of mortalityArray) {
        childFeatures.push(new PostSurveyMortalityToBiohubObject(mortality));
      }
    } else if (animalRecord.mortality) {
      // Handle case where mortality is a single object (according to interface)
      childFeatures.push(new PostSurveyMortalityToBiohubObject(animalRecord.mortality));
    }

    // Create ecological unit features for this animal if focal species data exists
    if (focalSpeciesData?.focal_species) {
      // Find the species that matches this animal's taxon
      const matchingSpecies = focalSpeciesData.focal_species.find((species) => species.tsn === animalRecord.itis_tsn);

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

  constructor(sampleSiteRecord: SampleSiteRecordWithGeojson, strata?: { name: string; description: string }[]) {
    defaultLog.debug({ label: 'PostSurveySamplingSiteToBiohubObject', message: 'params', sampleSiteRecord });

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
    const stratumChildFeatures = strata ? strata.map((stratum) => new PostStratumToBiohubObject(stratum)) : [];

    // Create block child features if blocks data is available in the sample site record
    const blockChildFeatures = sampleSiteRecord.blocks
      ? sampleSiteRecord.blocks.map((block) => new PostBlockToBiohubObject(block))
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

  constructor(samplingTechniqueRecord: SampleTechniqueRecord) {
    this.id = crypto.randomUUID();
    this.type = BiohubFeatureType.SAMPLE_TECHNIQUE;

    // Use attractant IDs array from the database and convert to code format
    const attractantsArray = (samplingTechniqueRecord.attractant_ids || []).map((attractant) => ({
      attractant_name: `code::attractant_lookup::${attractant.attractant_lookup_id}`
    }));

    // Single-value properties (first item only) collapsed from sample_technique_detail
    let method_attribute: string | null = null;
    let method_value: string | null = null;
    const firstAttrib = samplingTechniqueRecord.attribute_data?.filter(
      (a) => a.attribute_header != null || a.attribute_value != null
    )?.[0];
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

    // Single-value properties (first item only) collapsed from sample_technique_vantage
    let vantage_method_attribute: string | null = null;
    let vantage_method_value: string | null = null;
    const firstVantage = samplingTechniqueRecord.vantage_data?.filter(
      (v) => v.vantage_header != null || v.vantage_value != null
    )?.[0];
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
      method_name: `code::method_lookup::${samplingTechniqueRecord.method_lookup_id}`,
      attractant: attractantsArray,
      response_metric: `code::method_response_metric::${samplingTechniqueRecord.method_response_metric_id}`,
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

  constructor(habitatFeatureRecord: SurveyHabitatFeatureWithTaxonsAndSampling) {
    defaultLog.debug({ label: 'PostSurveyHabitatFeatureToBiohubObject', message: 'params', habitatFeatureRecord });

    // Combine date and time into a single timestamp
    let timestamp: string | null = null;
    if (habitatFeatureRecord.observed_time) {
      timestamp = `${habitatFeatureRecord.observed_date}T${habitatFeatureRecord.observed_time}Z`;
    } else if (habitatFeatureRecord.observed_date) {
      timestamp = `${habitatFeatureRecord.observed_date}T00:00:00.000Z`;
    }

    // Create associated species array from focal species
    const associatedSpeciesArray =
      habitatFeatureRecord.survey_habitat_feature_taxons?.map((species) => ({ taxon_id: species.itis_tsn })) || [];

    this.id = crypto.randomUUID();
    this.type = BiohubFeatureType.HABITAT_FEATURE;
    this.properties = {
      name: `code::habitat_feature_type::${habitatFeatureRecord.habitat_feature_type_id}`,
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

  constructor(deviceRecord: DeviceRecord) {
    defaultLog.debug({ label: 'PostTelemetryDeviceToBiohubObject', message: 'params', deviceRecord });

    this.id = crypto.randomUUID();
    this.type = BiohubFeatureType.TELEMETRY_DEVICE;
    this.properties = {
      device_manufacturer: `code::device_make::${deviceRecord.device_make_id}`,
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
export class PostTelemetryDeploymentToBiohubObject implements BioHubSubmissionFeature {
  id: string;
  type: string;
  properties: Record<string, unknown>;
  child_features: BioHubSubmissionFeature[];

  constructor(deploymentRecord: ExtendedDeploymentRecord, telemetry?: Telemetry[], animalRecords?: ICritterDetailed[]) {
    defaultLog.debug({ label: 'PostTelemetryDeploymentToBiohubObject', message: 'params', deploymentRecord });

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
    if (telemetry) {
      const telemetryFeatures = telemetry
        .filter((telemetryRecord) => {
          // Filter telemetry records that belong to this deployment
          return telemetryRecord.deployment_id === deploymentRecord.deployment_id;
        })
        .map((telemetryRecord) => new PostTelemetryToBiohubObject(telemetryRecord));

      this.child_features.push(...telemetryFeatures);
    }

    // Add frequency child feature if frequency data exists
    if (deploymentRecord.frequency != null || deploymentRecord.frequency_unit_id != null) {
      this.child_features.push(
        new PostTelemetryFrequencyToBiohubObject(deploymentRecord.frequency, deploymentRecord.frequency_unit_id)
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

  constructor(frequency: number | null, frequencyUnitId: number | null) {
    this.id = crypto.randomUUID();
    this.type = BiohubFeatureType.TELEMETRY_FREQUENCY;

    // Only include properties if they are not null, using code format
    this.properties = {};
    if (frequency != null) {
      this.properties.frequency = frequency;
    }
    if (frequencyUnitId != null) {
      this.properties.frequency_unit = `code::frequency_unit::${frequencyUnitId}`;
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

  constructor(codesetCategories: CodesetCategory[]) {
    defaultLog.debug({
      label: 'PostCodesetToBiohubObject',
      message: 'params',
      categoryCount: codesetCategories.length
    });

    this.id = crypto.randomUUID();
    this.type = BiohubFeatureType.CODESET;

    // Helper function to convert snake_case to Title Case
    const toTitleCase = (str: string): string => {
      return str
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    };

    // Convert categories array to object format
    const categoriesObject: Record<
      string,
      {
        label: string;
        description: string | null;
        codes: Record<string, { label: string; description: string | null }>;
      }
    > = {};

    for (const category of codesetCategories) {
      // Create category key: use table name as-is
      const categoryKey = category.name;

      // Convert snake_case to Title Case for label
      const categoryLabel = toTitleCase(category.name);

      // Convert codes array to object format
      const codesObject: Record<string, { label: string; description: string | null }> = {};
      for (const code of category.codes) {
        codesObject[code.id] = {
          label: code.name,
          description: code.description
        };
      }

      categoriesObject[categoryKey] = {
        label: categoryLabel,
        description: category.description,
        codes: codesObject
      };
    }

    this.properties = {
      categories: categoriesObject
    };
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
      codesetCategories
    } = options;

    const observationFeatures = observationRecords.map(
      (observation) =>
        new PostSurveyObservationToBiohubObject(observation, environmentDefinitions, measurementDefinitions)
    );

    const attachmentFeatures = surveyAttachments.map(
      (attachment) => new PostSurveyAttachmentsToBiohubObject(attachment)
    );

    const reportAttachmentFeatures = surveyReports.map(
      (attachment) => new PostSurveyReportAttachmentsToBiohubObject(attachment)
    );

    const animalFeatures = animalRecords.map((animal) => new PostSurveyAnimalToBiohubObject(animal, focalSpecies));

    // Create sampling features
    const samplingSiteFeatures = mapOrEmpty(
      samplingSites,
      (samplingSite) => new PostSurveySamplingSiteToBiohubObject(samplingSite, strata)
    );

    const samplingPeriodFeatures = mapOrEmpty(
      samplingPeriods,
      (samplingPeriod) => new PostSurveySamplingPeriodToBiohubObject(samplingPeriod)
    );

    const samplingTechniqueFeatures = mapOrEmpty(
      samplingTechniques,
      (samplingTechnique) => new PostSampleTechniqueToBiohubObject(samplingTechnique)
    );

    // Create habitat features
    const habitatFeatureFeatures = mapOrEmpty(
      habitatFeatures,
      (habitatFeature) => new PostSurveyHabitatFeatureToBiohubObject(habitatFeature)
    );

    // Create telemetry features
    const telemetryDeviceFeatures = mapOrEmpty(
      telemetryDevices,
      (device) => new PostTelemetryDeviceToBiohubObject(device)
    );

    const telemetryDeploymentFeatures = mapOrEmpty(
      telemetryDeployments,
      (deployment) => new PostTelemetryDeploymentToBiohubObject(deployment, telemetry, animalRecords)
    );

    // Create study area feature if survey location data is available
    const studyAreaFeature = createStudyAreaFeature(surveyLocation, surveyData.survey_name);

    const partnershipsValue = buildPartnershipsValue(partnerships, firstNations);

    // Create focal species array from focal species
    const focalSpeciesArray = buildFocalSpeciesArray(focalSpecies);

    // Create collected data array from survey types
    const collectedDataArray =
      surveyData.survey_types.map((survey_type_id) => ({ survey_type_id: String(survey_type_id) })) || [];

    // Create stratum features
    const stratumFeatures = mapOrEmpty(strata, (stratum) => new PostStratumToBiohubObject(stratum));

    // Create site selection strategies array
    const siteSelectionStrategiesArray = buildSiteSelectionStrategiesArray(siteSelectionStrategies);

    // Create codeset feature if codeset categories are available
    const codesetFeature = codesetCategories ? [new PostCodesetToBiohubObject(codesetCategories)] : [];

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
      ...observationFeatures,
      ...reportAttachmentFeatures,
      ...attachmentFeatures,
      ...animalFeatures,
      ...samplingSiteFeatures,
      ...samplingPeriodFeatures,
      ...samplingTechniqueFeatures,
      ...habitatFeatureFeatures,
      ...telemetryDeviceFeatures,
      ...telemetryDeploymentFeatures,
      ...studyAreaFeature,
      ...stratumFeatures,
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
        codesetCategories
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
  _firstNations: { id: number; name: string }[] | undefined
): {
  indigenous_partnerships: { name: string }[];
  stakeholder_partnerships: { name: string }[];
} | null {
  if (!partnerships) {
    return null;
  }

  const indigenousPartnerships = (partnerships.indigenous_partnerships || []).map((id) => ({
    name: `code::first_nations::${id}`
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

function buildSiteSelectionStrategiesArray(siteSelectionStrategies?: number[]): { strategy: string }[] {
  return (siteSelectionStrategies ?? []).map((site_strategy_id) => ({
    strategy: `code::site_strategy::${site_strategy_id}`
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

enum BiohubFeatureType {
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
