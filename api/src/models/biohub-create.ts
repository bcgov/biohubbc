import { Feature, FeatureCollection } from 'geojson';
import crypto from 'node:crypto';
import { ATTACHMENT_TYPE } from '../constants/attachments';
import { DeviceRecord } from '../database-models/device';
import { HabitatFeatureTypeRecord } from '../database-models/habitat-feature-type';
import { SurveyObservationRecord } from '../database-models/survey_observation';
import { ISurveyAttachment, ISurveyReportAttachment } from '../repositories/attachment-repository';
import { ICodeDescription } from '../repositories/code-repository';
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
  observationSigns?: ICodeDescription[];
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
  habitatFeatureTypes?: HabitatFeatureTypeRecord[];
  telemetryDevices?: DeviceRecord[];
  telemetryDeployments?: ExtendedDeploymentRecord[];
  telemetry?: Telemetry[];
  samplingTechniques?: SampleTechniqueRecord[];
  deviceMakes?: ICodeDescription[];
  frequencyUnits?: ICodeDescription[];
  partnerships?: { indigenous_partnerships: number[]; stakeholder_partnerships: string[] };
  focalSpecies?: { focal_species: ITaxonomyWithEcologicalUnits[] };
  surveyLocation?: SurveyLocationRecord[];
  firstNations?: { id: number; name: string }[];
  strata?: { name: string; description: string }[];
  siteSelectionStrategies?: string[];
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
    observationSigns?: ICodeDescription[],
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

    // Find the observation sign name from the sign ID
    const observationSign = observationSigns?.find((sign) => sign.id === observationRecord.observation_sign_id);

    this.id = crypto.randomUUID();
    this.type = BiohubFeatureType.OBSERVATION;
    this.properties = {
      survey_id: observationRecord.survey_id,
      taxon_id: observationRecord.itis_tsn,
      survey_sample_period_id: observationRecord?.survey_sample_period_id || null,
      count: observationRecord.count,
      timestamp: timestamp,
      sign: observationSign?.name || null,
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
          : null
    };

    // Create environmental condition child features if available
    const childFeatures: BioHubSubmissionFeature[] = [];

    if ('qualitative_environments' in observationRecord && observationRecord.qualitative_environments) {
      for (const env of observationRecord.qualitative_environments) {
        // Find the environment definition to get the name
        const envDef = environmentDefinitions?.qualitative_environments.find(
          (def) => def.environment_qualitative_id === env.environment_qualitative_id
        );
        const optionDef = envDef?.options.find(
          (opt) => opt.environment_qualitative_option_id === env.environment_qualitative_option_id
        );

        childFeatures.push(
          new PostSurveyEnvironmentalConditionToBiohubObject({
            type: 'qualitative',
            environment_qualitative_id: env.environment_qualitative_id,
            environment_qualitative_option_id: env.environment_qualitative_option_id,
            name: envDef?.name,
            option_name: optionDef?.name
          })
        );
      }
    }

    if ('quantitative_environments' in observationRecord && observationRecord.quantitative_environments) {
      for (const env of observationRecord.quantitative_environments) {
        // Find the environment definition to get the name and unit
        const envDef = environmentDefinitions?.quantitative_environments.find(
          (def) => def.environment_quantitative_id === env.environment_quantitative_id
        );

        childFeatures.push(
          new PostSurveyEnvironmentalConditionToBiohubObject({
            type: 'quantitative',
            environment_quantitative_id: env.environment_quantitative_id,
            value: env.value,
            name: envDef?.name,
            unit: envDef?.unit || undefined
          })
        );
      }
    }

    // Create subcount child features if available
    if ('subcounts' in observationRecord && observationRecord.subcounts) {
      for (const subcount of observationRecord.subcounts) {
        childFeatures.push(new PostSurveySubcountToBiohubObject(subcount, measurementDefinitions));
      }
    }

    this.child_features = childFeatures;
  }
}

/**
 * Object to be sent to Biohub API for creating an observation subcount.
 *
 * @export
 * @class PostSurveySubcountToBiohubObject
 * @implements {BioHubSubmissionFeature}
 */
export class PostSurveySubcountToBiohubObject implements BioHubSubmissionFeature {
  id: string;
  type: string;
  properties: Record<string, unknown>;
  child_features: BioHubSubmissionFeature[];

  constructor(
    subcountData: {
      observation_subcount_id: number | null;
      comment: string | null;
      subcount: number | null;
      qualitative_measurements: {
        critterbase_taxon_measurement_id: string;
        critterbase_measurement_qualitative_option_id: string;
      }[];
      quantitative_measurements: {
        critterbase_taxon_measurement_id: string;
        value: number;
      }[];
    },
    measurementDefinitions?: {
      qualitative_measurements: CBQualitativeMeasurementTypeDefinition[];
      quantitative_measurements: CBQuantitativeMeasurementTypeDefinition[];
    }
  ) {
    defaultLog.debug({ label: 'PostSurveySubcountToBiohubObject', message: 'params', subcountData });

    this.id = crypto.randomUUID();
    this.type = BiohubFeatureType.OBSERVATION_SUBCOUNT;

    this.properties = {
      comment: subcountData.comment,
      count: subcountData.subcount
    };

    // Create child features for quantitative measurements
    this.child_features = [];

    if (subcountData.quantitative_measurements && subcountData.quantitative_measurements.length > 0) {
      for (const measurement of subcountData.quantitative_measurements) {
        const measurementDef = measurementDefinitions?.quantitative_measurements.find(
          (def) => def.taxon_measurement_id === measurement.critterbase_taxon_measurement_id
        );

        this.child_features.push(new PostObservationSubcountMeasurementToBiohubObject(measurement, measurementDef));
      }
    }
  }
}

/**
 * Observation Subcount Measurement object to be sent to Biohub API for creating a measurement feature.
 *
 * @export
 * @class PostObservationSubcountMeasurementToBiohubObject
 * @implements {BioHubSubmissionFeature}
 */
export class PostObservationSubcountMeasurementToBiohubObject implements BioHubSubmissionFeature {
  id: string;
  type: string;
  properties: Record<string, unknown>;
  child_features: BioHubSubmissionFeature[];

  constructor(
    measurement: {
      critterbase_taxon_measurement_id: string;
      value: number;
    },
    measurementDefinition?: CBQuantitativeMeasurementTypeDefinition
  ) {
    this.id = crypto.randomUUID();
    this.type = BiohubFeatureType.OBSERVATION_SUBCOUNT_MEASUREMENT;

    this.properties = {
      measurement_type: measurementDefinition?.measurement_name || measurement.critterbase_taxon_measurement_id,
      measurement_value: measurement.value
    };

    this.child_features = [];
  }
}

/**
 * Object to be sent to Biohub API for creating an observation environmental condition.
 *
 * @export
 * @class PostSurveyEnvironmentalConditionToBiohubObject
 * @implements {BioHubSubmissionFeature}
 */
export class PostSurveyEnvironmentalConditionToBiohubObject implements BioHubSubmissionFeature {
  id: string;
  type: string;
  properties: Record<string, unknown>;
  child_features: BioHubSubmissionFeature[];

  constructor(
    environmentData:
      | {
          type: 'qualitative';
          environment_qualitative_id: string;
          environment_qualitative_option_id: string;
          name?: string;
          option_name?: string;
        }
      | {
          type: 'quantitative';
          environment_quantitative_id: string;
          value: number;
          name?: string;
          unit?: string;
        }
  ) {
    defaultLog.debug({ label: 'PostSurveyEnvironmentalConditionToBiohubObject', message: 'params', environmentData });

    this.id = crypto.randomUUID();
    this.type = BiohubFeatureType.OBSERVATION_ENVIRONMENTAL_CONDITION;

    if (environmentData.type === 'qualitative') {
      this.properties = {
        environmental_condition: environmentData.name || environmentData.environment_qualitative_id,
        environmental_condition_value: environmentData.option_name || environmentData.environment_qualitative_option_id
      };
    } else {
      this.properties = {
        environmental_condition: environmentData.name || environmentData.environment_quantitative_id,
        environmental_condition_value: `${environmentData.value}${environmentData.unit ? ' ' + environmentData.unit : ''}`
      };
    }

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
      artifact_id: reportAttachmentRecord.survey_report_attachment_id,
      filename: reportAttachmentRecord.file_name,
      file_type: ATTACHMENT_TYPE.REPORT,
      file_size: reportAttachmentRecord.file_size,
      title: reportAttachmentRecord.title,
      description: reportAttachmentRecord.description,
      year_published: reportAttachmentRecord.year_published
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
      sample_technique: samplingPeriodRecord.method_technique?.name || null
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

    // Parse attractants string into array, handling null/empty cases
    const attractantsArray = samplingTechniqueRecord.attractants
      ? samplingTechniqueRecord.attractants
          .split(';')
          .map((attractant) => attractant.trim())
          .filter((attractant) => attractant.length > 0)
          .map((attractant) => ({ attractant_name: attractant }))
      : [];

    this.properties = {
      name: samplingTechniqueRecord.method_name,
      description: samplingTechniqueRecord.description,
      method_name: samplingTechniqueRecord.method_lookup_name,
      attractant: attractantsArray,
      response_metric: samplingTechniqueRecord.response_metric,
      ...(samplingTechniqueRecord.distance_threshold
        ? { detect_distance: samplingTechniqueRecord.distance_threshold }
        : {})
    };

    // Create sample technique detail child features from attrib_data, filtering out entries where both values are null
    const techniqueDetailFeatures = samplingTechniqueRecord.attrib_data
      ? samplingTechniqueRecord.attrib_data
          .filter((attrib) => attrib.ah != null || attrib.av != null)
          .map((attrib) => new PostSampleTechniqueDetailToBiohubObject(attrib.ah, attrib.av))
      : [];

    // Create sample technique vantage child features from vantage_data, filtering out entries where both values are null
    const techniqueVantageFeatures = samplingTechniqueRecord.vantage_data
      ? samplingTechniqueRecord.vantage_data
          .filter((vantage) => vantage.vh != null || vantage.vv != null)
          .map((vantage) => new PostSampleTechniqueVantageToBiohubObject(vantage.vh, vantage.vv))
      : [];

    this.child_features = [...techniqueDetailFeatures, ...techniqueVantageFeatures];
  }
}

/**
 * Sample Technique Detail object to be sent to Biohub API for creating a survey sampling technique detail feature.
 *
 * @export
 * @class PostSampleTechniqueDetailToBiohubObject
 * @implements {BioHubSubmissionFeature}
 */
export class PostSampleTechniqueDetailToBiohubObject implements BioHubSubmissionFeature {
  id: string;
  type: string;
  properties: Record<string, unknown>;
  child_features: BioHubSubmissionFeature[];

  constructor(methodAttribute: string | null, methodValue: string | null) {
    this.id = crypto.randomUUID();
    this.type = BiohubFeatureType.SAMPLE_TECHNIQUE_DETAIL;

    // Only include properties if they are not null
    this.properties = {};
    if (methodAttribute != null) {
      this.properties.method_attribute = methodAttribute;
    }
    if (methodValue != null) {
      this.properties.method_value = methodValue;
    }

    this.child_features = [];
  }
}

/**
 * Sample Technique Vantage object to be sent to Biohub API for creating a survey sampling technique vantage feature.
 *
 * @export
 * @class PostSampleTechniqueVantageToBiohubObject
 * @implements {BioHubSubmissionFeature}
 */
export class PostSampleTechniqueVantageToBiohubObject implements BioHubSubmissionFeature {
  id: string;
  type: string;
  properties: Record<string, unknown>;
  child_features: BioHubSubmissionFeature[];

  constructor(methodVantage: string | null, methodValue: string | null) {
    this.id = crypto.randomUUID();
    this.type = BiohubFeatureType.SAMPLE_TECHNIQUE_VANTAGE;

    // Only include properties if they are not null
    this.properties = {};
    if (methodVantage != null) {
      this.properties.method_vantage = methodVantage;
    }
    if (methodValue != null) {
      this.properties.method_value = methodValue;
    }

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
    habitatFeatureTypes?: HabitatFeatureTypeRecord[]
  ) {
    defaultLog.debug({ label: 'PostSurveyHabitatFeatureToBiohubObject', message: 'params', habitatFeatureRecord });

    // Combine date and time into a single timestamp
    let timestamp: string | null = null;
    if (habitatFeatureRecord.observed_time) {
      timestamp = `${habitatFeatureRecord.observed_date}T${habitatFeatureRecord.observed_time}Z`;
    } else if (habitatFeatureRecord.observed_date) {
      timestamp = `${habitatFeatureRecord.observed_date}T00:00:00.000Z`;
    }

    // Find habitat feature type name
    const habitatFeatureType = habitatFeatureTypes?.find(
      (type) => type.habitat_feature_type_id === habitatFeatureRecord.habitat_feature_type_id
    );

    // Create associated species array from focal species
    const associatedSpeciesArray =
      habitatFeatureRecord.survey_habitat_feature_taxons?.map((species) => ({ taxon_id: species.itis_tsn })) || [];

    this.id = crypto.randomUUID();
    this.type = BiohubFeatureType.HABITAT_FEATURE;
    this.properties = {
      name: habitatFeatureType?.name || `Habitat Feature ${habitatFeatureRecord.habitat_feature_type_id}`,
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

  constructor(deviceRecord: DeviceRecord, deviceMakes?: ICodeDescription[]) {
    defaultLog.debug({ label: 'PostTelemetryDeviceToBiohubObject', message: 'params', deviceRecord });

    // Find device make name
    const deviceMake = deviceMakes?.find((make) => make.id === deviceRecord.device_make_id);

    this.id = crypto.randomUUID();
    this.type = BiohubFeatureType.TELEMETRY_DEVICE;
    this.properties = {
      device_manufacturer: deviceMake?.name || `Unknown Manufacturer ${deviceRecord.device_make_id}`,
      model: deviceRecord.model || null,
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

  constructor(
    deploymentRecord: ExtendedDeploymentRecord,
    frequencyUnits?: ICodeDescription[],
    telemetry?: Telemetry[],
    animalRecords?: ICritterDetailed[]
  ) {
    defaultLog.debug({ label: 'PostTelemetryDeploymentToBiohubObject', message: 'params', deploymentRecord });

    // Find frequency unit name
    const frequencyUnit = frequencyUnits?.find((unit) => unit.id === deploymentRecord.frequency_unit_id);

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
      const frequencyUnitName = deploymentRecord.frequency_unit_id
        ? frequencyUnit?.name || `Unknown Unit ${deploymentRecord.frequency_unit_id}`
        : null;

      // Only add the frequency child feature if at least one property is not null
      if (deploymentRecord.frequency != null || frequencyUnitName != null) {
        this.child_features.push(
          new PostTelemetryFrequencyToBiohubObject(deploymentRecord.frequency, frequencyUnitName)
        );
      }
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

  constructor(frequency: number | null, frequencyUnit: string | null) {
    this.id = crypto.randomUUID();
    this.type = BiohubFeatureType.TELEMETRY_FREQUENCY;

    // Only include properties if they are not null
    this.properties = {};
    if (frequency != null) {
      this.properties.frequency = frequency;
    }
    if (frequencyUnit != null) {
      this.properties.frequency_unit = frequencyUnit;
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
      observationSigns,
      environmentDefinitions,
      measurementDefinitions,
      samplingSites,
      samplingPeriods,
      habitatFeatures,
      habitatFeatureTypes,
      telemetryDevices,
      telemetryDeployments,
      telemetry,
      samplingTechniques,
      deviceMakes,
      frequencyUnits,
      partnerships,
      focalSpecies,
      surveyLocation,
      firstNations,
      strata,
      siteSelectionStrategies
    } = options;

    const observationFeatures = observationRecords.map(
      (observation) =>
        new PostSurveyObservationToBiohubObject(
          observation,
          observationSigns,
          environmentDefinitions,
          measurementDefinitions
        )
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
      (habitatFeature) => new PostSurveyHabitatFeatureToBiohubObject(habitatFeature, habitatFeatureTypes)
    );

    // Create telemetry features
    const telemetryDeviceFeatures = mapOrEmpty(
      telemetryDevices,
      (device) => new PostTelemetryDeviceToBiohubObject(device, deviceMakes)
    );

    const telemetryDeploymentFeatures = mapOrEmpty(
      telemetryDeployments,
      (deployment) => new PostTelemetryDeploymentToBiohubObject(deployment, frequencyUnits, telemetry, animalRecords)
    );

    // Create study area feature if survey location data is available
    const studyAreaFeature = createStudyAreaFeature(surveyLocation, surveyData.survey_name);

    const partnershipsValue = buildPartnershipsValue(partnerships, firstNations);

    // Create focal species array from focal species
    const focalSpeciesArray = buildFocalSpeciesArray(focalSpecies);

    // Create collected data array from survey types
    const collectedDataArray =
      surveyData.survey_types.map((survey_type_id) => ({ survey_type_id: survey_type_id })) || [];

    // Create stratum features
    const stratumFeatures = mapOrEmpty(strata, (stratum) => new PostStratumToBiohubObject(stratum));

    // Create site selection strategies array
    const siteSelectionStrategiesArray = buildSiteSelectionStrategiesArray(siteSelectionStrategies);

    this.id = crypto.randomUUID();
    this.type = BiohubFeatureType.DATASET;
    this.properties = {
      survey_id: surveyData.id,
      project_id: surveyData.project_id,
      name: surveyData.survey_name,
      ...buildSurveyDateProperties(surveyData),
      collected_data: collectedDataArray,
      objectives: surveyPurposeAndMethodologyData.additional_details,
      ...buildOptionalStringProperty(partnershipsValue, 'partnerships'),
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
      ...stratumFeatures
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
      observationSigns,
      environmentDefinitions,
      measurementDefinitions,
      samplingSites,
      samplingPeriods,
      samplingTechniques,
      habitatFeatures,
      habitatFeatureTypes,
      telemetryDevices,
      telemetryDeployments,
      telemetry,
      deviceMakes,
      frequencyUnits,
      partnerships,
      focalSpecies,
      surveyLocation,
      firstNations,
      strata,
      siteSelectionStrategies
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
        observationSigns,
        environmentDefinitions,
        measurementDefinitions,
        samplingSites,
        samplingPeriods,
        habitatFeatures,
        habitatFeatureTypes,
        telemetryDevices,
        telemetryDeployments,
        telemetry,
        samplingTechniques,
        deviceMakes,
        frequencyUnits,
        partnerships,
        focalSpecies,
        surveyLocation,
        firstNations,
        strata,
        siteSelectionStrategies
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
  firstNations: { id: number; name: string }[] | undefined
): string | null {
  if (!partnerships) {
    return null;
  }

  const indigenousPartners = (partnerships.indigenous_partnerships || []).map((id) => {
    const firstNation = firstNations?.find((fn) => fn.id === id);
    return firstNation?.name || `Indigenous Partnership ${id}`;
  });

  const stakeholderPartners = partnerships.stakeholder_partnerships || [];
  const combinedPartners = [...indigenousPartners, ...stakeholderPartners].filter(
    (partner) => partner && partner.length > 0
  );

  if (combinedPartners.length === 0) {
    return null;
  }

  return combinedPartners.join('; ');
}

function buildFocalSpeciesArray(focalSpecies?: { focal_species: ITaxonomyWithEcologicalUnits[] }): {
  taxon_id: number;
}[] {
  return focalSpecies?.focal_species?.map((species) => ({ taxon_id: species.tsn })) ?? [];
}

function buildSiteSelectionStrategiesArray(siteSelectionStrategies?: string[]): { strategy: string }[] {
  return (siteSelectionStrategies ?? []).map((strategy) => ({ strategy }));
}

function buildOptionalStringProperty(value: string | null | undefined, key: string): Record<string, string> {
  return value ? { [key]: value } : {};
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
  DATASET = 'dataset',
  ECOLOGICAL_UNIT = 'ecological_unit',
  FILE = 'file',
  HABITAT_FEATURE = 'habitat_feature',
  MARKING = 'marking',
  MEASUREMENT = 'measurement',
  MORTALITY = 'mortality',
  OBSERVATION = 'species_observation',
  OBSERVATION_ENVIRONMENTAL_CONDITION = 'observation_environmental_condition',
  OBSERVATION_SUBCOUNT = 'observation_subcount',
  OBSERVATION_SUBCOUNT_MEASUREMENT = 'observation_subcount_measurement',
  RELEASE = 'release',
  REPORT = 'report',
  SAMPLE_PERIOD = 'sample_period',
  SAMPLE_SITE = 'sample_site',
  SAMPLE_TECHNIQUE = 'sample_technique',
  SAMPLE_TECHNIQUE_DETAIL = 'sample_technique_detail',
  SAMPLE_TECHNIQUE_VANTAGE = 'sample_technique_vantage',
  STRATUM = 'stratum',
  STUDY_AREA = 'study_area',
  TELEMETRY = 'telemetry',
  TELEMETRY_DEPLOYMENT = 'telemetry_deployment',
  TELEMETRY_FREQUENCY = 'telemetry_frequency',
  TELEMETRY_DEVICE = 'telemetry_device'
}
