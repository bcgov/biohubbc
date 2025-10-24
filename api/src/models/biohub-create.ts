import crypto from 'crypto';
import { Feature, FeatureCollection } from 'geojson';
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
import { SampleTechniqueRecord } from '../services/sample-technique-service';
import { getLogger } from '../utils/logger';
import { GetSurveyData, GetSurveyPurposeAndMethodologyData } from './survey-view';

// Extended interface for sampling sites with geometry data
interface SampleSiteRecordWithGeojson extends SampleSiteRecordExtendedNonSpatial {
  geojson: any;
}

const defaultLog = getLogger('models/biohub-create');

interface BioHubSubmission {
  id: string;
  name: string;
  description: string;
  content: BioHubSubmissionFeature;
}
export interface BioHubSubmissionFeature {
  id: string;
  type: string;
  properties: Record<string, any>;
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
  properties: Record<string, any>;
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

    this.id = String(observationRecord.survey_observation_id);
    this.type = BiohubFeatureType.OBSERVATION;
    this.properties = {
      survey_id: observationRecord.survey_id,
      taxon_id: observationRecord.itis_tsn,
      survey_sample_period_id: observationRecord?.survey_sample_period_id || null,
      count: observationRecord.count,
      timestamp: timestamp,
      sign: observationSign?.name || null,
      geometry: {
        type: 'FeatureCollection',
        features:
          observationRecord.longitude && observationRecord.latitude
            ? [
                {
                  type: 'Feature',
                  geometry: {
                    type: 'Point',
                    coordinates: [observationRecord.longitude, observationRecord.latitude]
                  },
                  properties: {}
                }
              ]
            : []
      }
    };

    // Create environmental condition child features if available
    const childFeatures: BioHubSubmissionFeature[] = [];

    if ('qualitative_environments' in observationRecord && observationRecord.qualitative_environments) {
      observationRecord.qualitative_environments.forEach((env, index) => {
        // Find the environment definition to get the name
        const envDef = environmentDefinitions?.qualitative_environments.find(
          (def) => def.environment_qualitative_id === env.environment_qualitative_id
        );
        const optionDef = envDef?.options.find(
          (opt) => opt.environment_qualitative_option_id === env.environment_qualitative_option_id
        );

        childFeatures.push(
          new PostSurveyEnvironmentalConditionToBiohubObject(
            {
              type: 'qualitative',
              environment_qualitative_id: env.environment_qualitative_id,
              environment_qualitative_option_id: env.environment_qualitative_option_id,
              name: envDef?.name,
              option_name: optionDef?.name
            },
            index
          )
        );
      });
    }

    if ('quantitative_environments' in observationRecord && observationRecord.quantitative_environments) {
      observationRecord.quantitative_environments.forEach((env, index) => {
        // Find the environment definition to get the name and unit
        const envDef = environmentDefinitions?.quantitative_environments.find(
          (def) => def.environment_quantitative_id === env.environment_quantitative_id
        );

        childFeatures.push(
          new PostSurveyEnvironmentalConditionToBiohubObject(
            {
              type: 'quantitative',
              environment_quantitative_id: env.environment_quantitative_id,
              value: env.value,
              name: envDef?.name,
              unit: envDef?.unit || undefined
            },
            childFeatures.length + index
          )
        );
      });
    }

    // Create subcount child features if available
    if ('subcounts' in observationRecord && observationRecord.subcounts) {
      observationRecord.subcounts.forEach((subcount, index) => {
        childFeatures.push(
          new PostSurveySubcountToBiohubObject(subcount, childFeatures.length + index, measurementDefinitions)
        );
      });
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
  properties: Record<string, any>;
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
    index: number,
    measurementDefinitions?: {
      qualitative_measurements: CBQualitativeMeasurementTypeDefinition[];
      quantitative_measurements: CBQuantitativeMeasurementTypeDefinition[];
    }
  ) {
    defaultLog.debug({ label: 'PostSurveySubcountToBiohubObject', message: 'params', subcountData });

    this.id = `subcount-${index}`;
    this.type = BiohubFeatureType.OBSERVATION_SUBCOUNT;

    // Find measurement types and values with human-readable names
    const measurementType = this.getMeasurementTypeAndValue(subcountData, measurementDefinitions);

    this.properties = {
      measurement_type: measurementType.type,
      measurement_value: measurementType.value,
      comment: subcountData.comment,
      count: subcountData.subcount
    };

    this.child_features = [];
  }

  private getMeasurementTypeAndValue(
    subcountData: {
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
  ): { type: string; value: string } {
    // Check for qualitative measurements first
    if (subcountData.qualitative_measurements.length > 0) {
      const measurement = subcountData.qualitative_measurements[0];
      const measurementDef = measurementDefinitions?.qualitative_measurements.find(
        (def) => def.taxon_measurement_id === measurement.critterbase_taxon_measurement_id
      );
      const optionDef = measurementDef?.options.find(
        (opt: any) => opt.qualitative_option_id === measurement.critterbase_measurement_qualitative_option_id
      );

      return {
        type: measurementDef?.measurement_name || measurement.critterbase_taxon_measurement_id,
        value: optionDef?.option_label || measurement.critterbase_measurement_qualitative_option_id
      };
    }

    // Check for quantitative measurements
    if (subcountData.quantitative_measurements.length > 0) {
      const measurement = subcountData.quantitative_measurements[0];
      const measurementDef = measurementDefinitions?.quantitative_measurements.find(
        (def) => def.taxon_measurement_id === measurement.critterbase_taxon_measurement_id
      );

      const unitSuffix = measurementDef?.unit ? ` ${measurementDef.unit}` : '';

      return {
        type: measurementDef?.measurement_name || measurement.critterbase_taxon_measurement_id,
        value: `${measurement.value}${unitSuffix}`
      };
    }

    // No measurements available
    return {
      type: '',
      value: ''
    };
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
  properties: Record<string, any>;
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
        },
    index: number
  ) {
    defaultLog.debug({ label: 'PostSurveyEnvironmentalConditionToBiohubObject', message: 'params', environmentData });

    this.id = `environmental-condition-${index}`;
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
  properties: Record<string, any>;
  child_features: BioHubSubmissionFeature[];

  constructor(captureRecord: ICritterDetailed['captures'][0]) {
    defaultLog.debug({ label: 'PostSurveyCaptureToBiohubObject', message: 'params', captureRecord });

    // Combine date and time into a single timestamp
    const timestamp = captureRecord.capture_time
      ? `${captureRecord.capture_date}T${captureRecord.capture_time}`
      : captureRecord.capture_date;

    this.id = captureRecord.capture_id;
    this.type = BiohubFeatureType.CAPTURE;
    this.properties = {
      description: captureRecord.capture_comment,
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
        : {
            type: 'FeatureCollection',
            features: []
          }
    };

    // Create child features for markings and measurements
    const childFeatures: BioHubSubmissionFeature[] = [];

    // Add marking features
    captureRecord.markings?.forEach((marking) => {
      childFeatures.push(new PostSurveyMarkingToBiohubObject(marking));
    });

    // Add quantitative measurement features
    captureRecord.quantitative_measurements?.forEach((measurement) => {
      childFeatures.push(new PostSurveyMeasurementToBiohubObject(measurement));
    });

    // Note: qualitative_measurements could also be added here if needed

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
  properties: Record<string, any>;
  child_features: BioHubSubmissionFeature[];

  constructor(captureRecord: ICritterDetailed['captures'][0]) {
    defaultLog.debug({ label: 'PostSurveyReleaseToBiohubObject', message: 'params', captureRecord });

    // Combine release date and time into a single timestamp
    const timestamp = captureRecord.release_time
      ? `${captureRecord.release_date}T${captureRecord.release_time}`
      : captureRecord.release_date;

    this.id = `${captureRecord.capture_id}-release`;
    this.type = BiohubFeatureType.RELEASE;
    this.properties = {
      description: captureRecord.release_comment,
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
        : {
            type: 'FeatureCollection',
            features: []
          }
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
  properties: Record<string, any>;
  child_features: BioHubSubmissionFeature[];

  constructor(markingRecord: ICritterDetailed['captures'][0]['markings'][0]) {
    defaultLog.debug({ label: 'PostSurveyMarkingToBiohubObject', message: 'params', markingRecord });

    this.id = markingRecord.marking_id || `marking-${Date.now()}`;
    this.type = BiohubFeatureType.MARKING;
    this.properties = {
      marking_type: markingRecord.marking_type,
      identifier: markingRecord.identifier,
      colour: markingRecord.secondary_colour
        ? `${markingRecord.primary_colour}/${markingRecord.secondary_colour}`
        : markingRecord.primary_colour,
      body_position: (markingRecord as any).taxon_marking_body_location || markingRecord.body_location,
      description: markingRecord.comment || null
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
  properties: Record<string, any>;
  child_features: BioHubSubmissionFeature[];

  constructor(measurementRecord: any) {
    defaultLog.debug({ label: 'PostSurveyMeasurementToBiohubObject', message: 'params', measurementRecord });

    this.id = measurementRecord.measurement_quantitative_id || `measurement-${Date.now()}`;
    this.type = BiohubFeatureType.MEASUREMENT;
    this.properties = {
      measurement_type: (measurementRecord as any).measurement_name || 'unknown',
      measurement_value: measurementRecord.value.toString(),
      description: (measurementRecord as any).comment || measurementRecord.measurement_comment
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
  properties: Record<string, any>;
  child_features: BioHubSubmissionFeature[];

  constructor(mortalityRecord: any) {
    defaultLog.debug({ label: 'PostSurveyMortalityToBiohubObject', message: 'params', mortalityRecord });

    this.id = mortalityRecord.mortality_id || `mortality-${Date.now()}`;
    this.type = BiohubFeatureType.MORTALITY;
    this.properties = {
      description: mortalityRecord.mortality_comment || null,
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
        : {
            type: 'FeatureCollection',
            features: []
          },
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
  properties: Record<string, any>;
  child_features: BioHubSubmissionFeature[];

  constructor(animalRecord: ICritterDetailed) {
    defaultLog.debug({ label: 'PostSurveyAnimalToBiohubObject', message: 'params', animalRecord });

    // Create capture and release features for each capture record
    const childFeatures: BioHubSubmissionFeature[] = [];

    animalRecord.captures?.forEach((capture) => {
      // Always create capture feature
      childFeatures.push(new PostSurveyCaptureToBiohubObject(capture));

      // Create release feature if release data exists
      if (capture.release_date) {
        childFeatures.push(new PostSurveyReleaseToBiohubObject(capture));
      }
    });

    // Create mortality features if mortality data exists
    // Note: The actual JSON data shows mortality as an array, but the interface shows it as a single object
    const mortalityArray = (animalRecord as any).mortality || [];
    if (Array.isArray(mortalityArray)) {
      mortalityArray.forEach((mortality: any) => {
        childFeatures.push(new PostSurveyMortalityToBiohubObject(mortality));
      });
    } else if (animalRecord.mortality) {
      // Handle case where mortality is a single object (according to interface)
      childFeatures.push(new PostSurveyMortalityToBiohubObject(animalRecord.mortality));
    }

    this.id = animalRecord.critter_id;
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
  properties: Record<string, any>;
  child_features: BioHubSubmissionFeature[];

  constructor(attachmentRecord: ISurveyAttachment) {
    defaultLog.debug({ label: 'PostSurveyAttachmentsToBiohubObject', message: 'params', attachmentRecord });

    this.id = attachmentRecord.uuid;
    this.type = BiohubFeatureType.ARTIFACT;
    this.properties = {
      artifact_id: attachmentRecord.survey_attachment_id,
      filename: attachmentRecord.file_name,
      file_type: attachmentRecord.file_type,
      file_size: attachmentRecord.file_size,
      title: attachmentRecord?.title || null,
      description: attachmentRecord?.description || null
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
  properties: Record<string, any>;
  child_features: BioHubSubmissionFeature[];

  constructor(reportAttachmentRecord: ISurveyReportAttachment) {
    defaultLog.debug({ label: 'PostSurveyReportAttachmentsToBiohubObject', message: 'params', reportAttachmentRecord });

    this.id = reportAttachmentRecord.uuid;
    this.type = BiohubFeatureType.ARTIFACT;
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
  properties: Record<string, any>;
  child_features: BioHubSubmissionFeature[];

  constructor(sampleSiteRecord: SampleSiteRecordWithGeojson, index: number) {
    defaultLog.debug({ label: 'PostSurveySamplingSiteToBiohubObject', message: 'params', sampleSiteRecord });

    this.id = `sample-site-${sampleSiteRecord.survey_sample_site_id || index}`;
    this.type = BiohubFeatureType.SAMPLE_SITE;
    this.properties = {
      name: sampleSiteRecord.name,
      description: sampleSiteRecord.description,
      geometry: sampleSiteRecord.geojson
        ? {
            type: 'FeatureCollection',
            features: [sampleSiteRecord.geojson]
          }
        : {
            type: 'FeatureCollection',
            features: []
          }
    };
    this.child_features = [];
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
  properties: Record<string, any>;
  child_features: BioHubSubmissionFeature[];

  constructor(samplingPeriodRecord: SurveySamplePeriodDetails, index: number) {
    defaultLog.debug({ label: 'PostSurveySamplingPeriodToBiohubObject', message: 'params', samplingPeriodRecord });

    this.id = `sample-period-${samplingPeriodRecord.survey_sample_period_id || index}`;
    this.type = BiohubFeatureType.SAMPLE_PERIOD;
    this.properties = {
      start_date: samplingPeriodRecord.start_time
        ? `${samplingPeriodRecord.start_date}T${samplingPeriodRecord.start_time}.000Z`
        : `${samplingPeriodRecord.start_date}T00:00:00.000Z`,
      end_date: samplingPeriodRecord.end_time
        ? `${samplingPeriodRecord.end_date}T${samplingPeriodRecord.end_time}.000Z`
        : `${samplingPeriodRecord.end_date}T23:59:59.000Z`,
      site_identifier: samplingPeriodRecord.survey_sample_site?.survey_sample_site_id.toString() || null,
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
  properties: Record<string, any>;
  child_features: BioHubSubmissionFeature[];

  constructor(samplingTechniqueRecord: SampleTechniqueRecord, index: number) {
    this.id = `sample-technique-${samplingTechniqueRecord.method_technique_id || index}`;
    this.type = BiohubFeatureType.SAMPLE_TECHNIQUE;
    this.properties = {
      name: samplingTechniqueRecord.method_name,
      description: samplingTechniqueRecord.description,
      method_name: samplingTechniqueRecord.method_lookup_name,
      attractant: samplingTechniqueRecord.attractants || '',
      response_metric: samplingTechniqueRecord.response_metric
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
  properties: Record<string, any>;
  child_features: BioHubSubmissionFeature[];

  constructor(
    habitatFeatureRecord: SurveyHabitatFeatureWithTaxonsAndSampling,
    index: number,
    habitatFeatureTypes?: HabitatFeatureTypeRecord[]
  ) {
    defaultLog.debug({ label: 'PostSurveyHabitatFeatureToBiohubObject', message: 'params', habitatFeatureRecord });

    // Combine date and time into a single timestamp
    const timestamp = habitatFeatureRecord.observed_time
      ? `${habitatFeatureRecord.observed_date}T${habitatFeatureRecord.observed_time}Z`
      : habitatFeatureRecord.observed_date
        ? `${habitatFeatureRecord.observed_date}T00:00:00.000Z`
        : null;

    // Find habitat feature type name
    const habitatFeatureType = habitatFeatureTypes?.find(
      (type) => type.habitat_feature_type_id === habitatFeatureRecord.habitat_feature_type_id
    );

    // Get the primary taxon (species) from the habitat feature taxons
    const primaryTaxon = habitatFeatureRecord.survey_habitat_feature_taxons?.[0];
    const taxonId = primaryTaxon?.itis_tsn || null;

    this.id = `habitat-feature-${habitatFeatureRecord.survey_habitat_feature_id || index}`;
    this.type = BiohubFeatureType.HABITAT_FEATURE;
    this.properties = {
      name: habitatFeatureType?.name || `Habitat Feature ${habitatFeatureRecord.habitat_feature_type_id}`,
      count: habitatFeatureRecord.count,
      timestamp: timestamp,
      ...(taxonId && { taxon_id: taxonId }),
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
          : {
              type: 'FeatureCollection',
              features: []
            }
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
  properties: Record<string, any>;
  child_features: BioHubSubmissionFeature[];

  constructor(deviceRecord: DeviceRecord, index: number, deviceMakes?: ICodeDescription[]) {
    defaultLog.debug({ label: 'PostTelemetryDeviceToBiohubObject', message: 'params', deviceRecord });

    // Find device make name
    const deviceMake = deviceMakes?.find((make) => make.id === deviceRecord.device_make_id);

    this.id = `telemetry-device-${deviceRecord.device_id || index}`;
    this.type = BiohubFeatureType.TELEMETRY_DEVICE;
    this.properties = {
      device_manufacturer: deviceMake?.name || `Unknown Manufacturer ${deviceRecord.device_make_id}`,
      model: deviceRecord.model || '',
      description: deviceRecord.comment || '',
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
  properties: Record<string, any>;
  child_features: BioHubSubmissionFeature[];

  constructor(deploymentRecord: ExtendedDeploymentRecord, index: number, frequencyUnits?: ICodeDescription[]) {
    defaultLog.debug({ label: 'PostTelemetryDeploymentToBiohubObject', message: 'params', deploymentRecord });

    // Find frequency unit name
    const frequencyUnit = frequencyUnits?.find((unit) => unit.id === deploymentRecord.frequency_unit_id);

    this.id = `telemetry-deployment-${deploymentRecord.deployment_id || index}`;
    this.type = BiohubFeatureType.TELEMETRY_DEPLOYMENT;
    this.properties = {
      animal_identifier: deploymentRecord.critterbase_critter_id || null,
      device: deploymentRecord.serial || `Device ${deploymentRecord.device_id}`,
      start_date: deploymentRecord.attachment_start_date,
      ...(deploymentRecord.attachment_end_date && { end_date: deploymentRecord.attachment_end_date }),
      ...(deploymentRecord.frequency && { frequency: deploymentRecord.frequency }),
      ...(deploymentRecord.frequency_unit_id && {
        frequency_unit: frequencyUnit?.name || `Unknown Unit ${deploymentRecord.frequency_unit_id}`
      })
    };
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
  properties: Record<string, any>;
  child_features: BioHubSubmissionFeature[];

  constructor(telemetryRecord: Telemetry, index: number) {
    this.id = `telemetry_${index}`;
    this.type = BiohubFeatureType.TELEMETRY;
    this.properties = {
      timestamp: telemetryRecord.acquisition_date,
      geometry: {
        type: 'FeatureCollection',
        features:
          telemetryRecord.longitude && telemetryRecord.latitude
            ? [
                {
                  type: 'Feature',
                  geometry: {
                    type: 'Point',
                    coordinates: [telemetryRecord.longitude, telemetryRecord.latitude]
                  },
                  properties: {}
                }
              ]
            : []
      }
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
  properties: Record<string, any>;
  child_features: BioHubSubmissionFeature[];

  constructor(surveyLocation: SurveyLocationRecord[], surveyName: string) {
    this.id = 'study-area';
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
 * Object to be sent to Biohub API for creating a survey.
 *
 * @export
 * @class PostSurveyToBiohubObject
 * @implements {BioHubSubmissionFeature}
 */
export class PostSurveyToBiohubObject implements BioHubSubmissionFeature {
  id: string;
  type: string;
  properties: Record<string, any>;
  child_features: BioHubSubmissionFeature[];

  constructor(
    surveyData: GetSurveyData,
    observationRecords: SurveyObservationRecord[],
    surveyGeometry: FeatureCollection,
    surveyAttachments: ISurveyAttachment[],
    surveyReports: ISurveyReportAttachment[],
    animalRecords: ICritterDetailed[] = [],
    observationSigns?: ICodeDescription[],
    environmentDefinitions?: {
      qualitative_environments: QualitativeEnvironmentTypeDefinition[];
      quantitative_environments: QuantitativeEnvironmentTypeDefinition[];
    },
    measurementDefinitions?: {
      qualitative_measurements: CBQualitativeMeasurementTypeDefinition[];
      quantitative_measurements: CBQuantitativeMeasurementTypeDefinition[];
    },
    samplingSites?: SampleSiteRecordWithGeojson[],
    samplingPeriods?: SurveySamplePeriodDetails[],
    habitatFeatures?: SurveyHabitatFeatureWithTaxonsAndSampling[],
    habitatFeatureTypes?: HabitatFeatureTypeRecord[],
    telemetryDevices?: DeviceRecord[],
    telemetryDeployments?: ExtendedDeploymentRecord[],
    telemetry?: Telemetry[],
    samplingTechniques?: SampleTechniqueRecord[],
    deviceMakes?: ICodeDescription[],
    frequencyUnits?: ICodeDescription[],
    partnerships?: { indigenous_partnerships: number[]; stakeholder_partnerships: string[] },
    focalSpecies?: { focal_species: { tsn: number }[] },
    surveyLocation?: SurveyLocationRecord[],
    firstNations?: { id: number; name: string }[]
  ) {
    defaultLog.debug({ label: 'PostSurveyToBiohubObject', message: 'params', surveyData });

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

    const animalFeatures = animalRecords.map((animal) => new PostSurveyAnimalToBiohubObject(animal));

    // Create sampling features
    const samplingSiteFeatures = samplingSites
      ? samplingSites.map((samplingSite, index) => new PostSurveySamplingSiteToBiohubObject(samplingSite, index))
      : [];

    const samplingPeriodFeatures = samplingPeriods
      ? samplingPeriods.map(
          (samplingPeriod, index) => new PostSurveySamplingPeriodToBiohubObject(samplingPeriod, index)
        )
      : [];

    const samplingTechniqueFeatures = samplingTechniques
      ? samplingTechniques.map(
          (samplingTechnique, index) => new PostSampleTechniqueToBiohubObject(samplingTechnique, index)
        )
      : [];

    // Create habitat features
    const habitatFeatureFeatures = habitatFeatures
      ? habitatFeatures.map(
          (habitatFeature, index) =>
            new PostSurveyHabitatFeatureToBiohubObject(habitatFeature, index, habitatFeatureTypes)
        )
      : [];

    // Create telemetry features
    const telemetryDeviceFeatures = telemetryDevices
      ? telemetryDevices.map((device, index) => new PostTelemetryDeviceToBiohubObject(device, index, deviceMakes))
      : [];

    const telemetryDeploymentFeatures = telemetryDeployments
      ? telemetryDeployments.map(
          (deployment, index) => new PostTelemetryDeploymentToBiohubObject(deployment, index, frequencyUnits)
        )
      : [];

    const telemetryFeatures = telemetry
      ? telemetry.map((telemetryRecord, index) => new PostTelemetryToBiohubObject(telemetryRecord, index))
      : [];

    // Create study area feature if survey location data is available
    const studyAreaFeature =
      surveyLocation && surveyLocation.length > 0
        ? [new PostStudyAreaToBiohubObject(surveyLocation, surveyData.survey_name)]
        : [];

    // Combine partnerships into a single string
    const partnershipsString = partnerships
      ? [
          ...(partnerships.indigenous_partnerships || []).map((id) => {
            const firstNation = firstNations?.find((fn) => fn.id === id);
            return firstNation?.name || `Indigenous Partnership ${id}`;
          }),
          ...(partnerships.stakeholder_partnerships || [])
        ].join('; ')
      : '';

    // Get first objective species taxon ID
    const firstObjectiveSpeciesTaxonId = focalSpecies?.focal_species?.[0]?.tsn || null;

    this.id = surveyData.uuid;
    this.type = BiohubFeatureType.DATASET;
    this.properties = {
      survey_id: surveyData.id,
      project_id: surveyData.project_id,
      name: surveyData.survey_name,
      guid: crypto.createHash('sha256').update(String(surveyData.id)).digest('hex'),
      start_date: surveyData.start_date,
      end_date: surveyData.end_date,
      survey_types: surveyData.survey_types,
      revision_count: surveyData.revision_count,
      geometry: surveyGeometry,
      ...(partnershipsString && { partnerships: partnershipsString }),
      ...(firstObjectiveSpeciesTaxonId && { taxon_id: firstObjectiveSpeciesTaxonId })
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
      ...telemetryFeatures,
      ...studyAreaFeature
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
    surveyGeometry: FeatureCollection,
    surveyAttachments: ISurveyAttachment[],
    surveyReports: ISurveyReportAttachment[],
    submissionComment: string,
    animalRecords: ICritterDetailed[] = [],
    observationSigns?: ICodeDescription[],
    environmentDefinitions?: {
      qualitative_environments: QualitativeEnvironmentTypeDefinition[];
      quantitative_environments: QuantitativeEnvironmentTypeDefinition[];
    },
    measurementDefinitions?: {
      qualitative_measurements: CBQualitativeMeasurementTypeDefinition[];
      quantitative_measurements: CBQuantitativeMeasurementTypeDefinition[];
    },
    samplingSites?: SampleSiteRecordWithGeojson[],
    samplingPeriods?: SurveySamplePeriodDetails[],
    samplingTechniques?: SampleTechniqueRecord[],
    habitatFeatures?: SurveyHabitatFeatureWithTaxonsAndSampling[],
    habitatFeatureTypes?: HabitatFeatureTypeRecord[],
    telemetryDevices?: DeviceRecord[],
    telemetryDeployments?: ExtendedDeploymentRecord[],
    telemetry?: Telemetry[],
    deviceMakes?: ICodeDescription[],
    frequencyUnits?: ICodeDescription[],
    partnerships?: { indigenous_partnerships: number[]; stakeholder_partnerships: string[] },
    focalSpecies?: { focal_species: { tsn: number }[] },
    surveyLocation?: SurveyLocationRecord[],
    firstNations?: { id: number; name: string }[]
  ) {
    defaultLog.debug({ label: 'PostSurveySubmissionToBioHubObject' });

    this.id = surveyData.uuid;
    this.name = surveyData.survey_name;
    this.description = GetSurveyPurposeAndMethodologyData.additional_details;
    this.comment = submissionComment;
    this.content = new PostSurveyToBiohubObject(
      surveyData,
      observationRecords,
      surveyGeometry,
      surveyAttachments,
      surveyReports,
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
      firstNations
    );

    defaultLog.debug({
      label: 'PostSurveySubmissionToBioHubObject',
      message: 'constructed',
      data: this
    });
  }
}

enum BiohubFeatureType {
  ANIMAL = 'animal', // Existing
  CAPTURE = 'capture',
  DATASET = 'dataset', // Existing
  ECOLOGICAL_UNIT = 'ecological_unit',
  FILE = 'file',
  FREQUENCY = 'frequency',
  HABITAT_FEATURE = 'habitat_feature',
  IMAGE = 'image',
  MARKING = 'marking',
  MEASUREMENT = 'measurement',
  MORTALITY = 'mortality',
  OBSERVATION = 'species_observation', // Existing but renamed to species_observation
  OBSERVATION_ENVIRONMENTAL_CONDITION = 'observation_environmental_condition',
  OBSERVATION_SUBCOUNT = 'observation_subcount',
  RELEASE = 'release',
  REPORT = 'report',
  SAMPLE_PERIOD = 'sample_period',
  SAMPLE_SITE = 'sample_site',
  SAMPLE_TECHNIQUE = 'sample_technique',
  STRATUM = 'stratum',
  STUDY_AREA = 'study_area',
  TELEMETRY = 'telemetry',
  TELEMETRY_DEPLOYMENT = 'telemetry_deployment',
  TELEMETRY_DEVICE = 'telemetry_device',
  ARTIFACT = 'artifact' // UNKNOWN
}
