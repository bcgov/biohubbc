import {
  mdiAccessPoint,
  mdiFamilyTree,
  mdiFormatListGroup,
  mdiInformationOutline,
  mdiRuler,
  mdiSkullOutline,
  mdiSpiderWeb,
  mdiTagOutline
} from '@mdi/js';
import { SurveyAnimalsI18N } from 'constants/i18n';
import { v4 } from 'uuid';
import {
  AnimalSex,
  IAnimal,
  IAnimalCapture,
  IAnimalCollectionUnit,
  IAnimalMarking,
  IAnimalMeasurement,
  IAnimalMortality,
  IAnimalRelationship,
  ProjectionMode
} from './animal';

export type IAnimalSections =
  | 'General'
  | 'Ecological Units'
  | 'Markings'
  | 'Measurements'
  | 'Capture Events'
  | 'Mortality Events'
  | 'Family'
  | 'Telemetry';
//| 'Observations'

interface IAnimalSectionsMap
  extends Record<
    IAnimalSections,
    {
      animalKeyName: keyof IAnimal;
      defaultFormValue: () => object;
      addBtnText?: string;
      dialogTitle: string;
      infoText: string;
      mdiIcon: string;
    }
  > {
  [SurveyAnimalsI18N.animalGeneralTitle]: {
    animalKeyName: 'general';
    //This probably needs to change to the correct object, general does not use the formikArray pattern
    defaultFormValue: () => object;
    addBtnText?: string;
    dialogTitle: string;
    infoText: string;
    mdiIcon: string;
  };
  [SurveyAnimalsI18N.animalCollectionUnitTitle]: {
    animalKeyName: 'collectionUnits';
    defaultFormValue: () => IAnimalCollectionUnit;
    addBtnText: string;
    dialogTitle: string;
    infoText: string;
    mdiIcon: string;
  };
  [SurveyAnimalsI18N.animalMarkingTitle]: {
    animalKeyName: 'markings';
    defaultFormValue: () => IAnimalMarking;
    addBtnText: string;
    dialogTitle: string;
    infoText: string;
    mdiIcon: string;
  };
  [SurveyAnimalsI18N.animalMeasurementTitle]: {
    animalKeyName: 'measurements';
    defaultFormValue: () => IAnimalMeasurement;
    addBtnText: string;
    dialogTitle: string;
    infoText: string;
    mdiIcon: string;
  };
  [SurveyAnimalsI18N.animalCaptureTitle]: {
    animalKeyName: 'captures';
    defaultFormValue: () => IAnimalCapture;
    addBtnText: string;
    dialogTitle: string;
    infoText: string;
    mdiIcon: string;
  };
  [SurveyAnimalsI18N.animalMortalityTitle]: {
    animalKeyName: 'mortality';
    defaultFormValue: () => IAnimalMortality;
    addBtnText: string;
    dialogTitle: string;
    infoText: string;
    mdiIcon: string;
  };
  [SurveyAnimalsI18N.animalFamilyTitle]: {
    animalKeyName: 'family';
    defaultFormValue: () => IAnimalRelationship;
    addBtnText: string;
    dialogTitle: string;
    infoText: string;
    mdiIcon: string;
  };
}

export const ANIMAL_SECTIONS_FORM_MAP: IAnimalSectionsMap = {
  [SurveyAnimalsI18N.animalGeneralTitle]: {
    animalKeyName: 'general',
    defaultFormValue: () => ({
      wlh_id: '',
      taxon_id: '',
      taxon_name: '',
      animal_id: '',
      sex: AnimalSex.UNKNOWN,
      critter_id: ''
    }),
    dialogTitle: 'General Information',
    infoText: SurveyAnimalsI18N.animalGeneralHelp,
    mdiIcon: mdiInformationOutline
  },
  [SurveyAnimalsI18N.animalCollectionUnitTitle]: {
    animalKeyName: 'collectionUnits',
    addBtnText: 'Add Unit',
    defaultFormValue: () => ({
      _id: v4(),
      collection_unit_id: '',
      category_name: '',
      unit_name: '',
      collection_category_id: '',
      critter_collection_unit_id: undefined
    }),
    dialogTitle: 'Ecological Unit',
    infoText: SurveyAnimalsI18N.animalCollectionUnitHelp,
    mdiIcon: mdiFormatListGroup
  },
  [SurveyAnimalsI18N.animalMarkingTitle]: {
    animalKeyName: 'markings',
    addBtnText: 'Add Marking',
    defaultFormValue: () => ({
      marking_type_id: '',
      taxon_marking_body_location_id: '',
      primary_colour_id: '',
      secondary_colour_id: '',
      marking_comment: '',
      marking_id: undefined,
      primary_colour: '',
      secondary_colour: '',
      marking_type: '',
      body_location: ''
    }),
    dialogTitle: 'Marking',
    infoText: SurveyAnimalsI18N.animalMarkingHelp,
    mdiIcon: mdiTagOutline
  },
  [SurveyAnimalsI18N.animalMeasurementTitle]: {
    animalKeyName: 'measurements',
    addBtnText: 'Add Measurement',
    defaultFormValue: () => ({
      measurement_qualitative_id: undefined,
      measurement_quantitative_id: undefined,
      taxon_measurement_id: '',
      value: '' as unknown as number,
      qualitative_option_id: '',
      measured_timestamp: '' as unknown as Date,
      measurement_comment: '',
      measurement_name: '',
      option_label: ''
    }),
    dialogTitle: 'Measurement',
    infoText: SurveyAnimalsI18N.animalMeasurementHelp,
    mdiIcon: mdiRuler
  },
  [SurveyAnimalsI18N.animalMortalityTitle]: {
    animalKeyName: 'mortality',
    addBtnText: 'Add Mortality',
    defaultFormValue: () => ({
      mortality_longitude: '' as unknown as number,
      mortality_latitude: '' as unknown as number,
      mortality_utm_northing: '' as unknown as number,
      mortality_utm_easting: '' as unknown as number,
      mortality_timestamp: '' as unknown as Date,
      mortality_coordinate_uncertainty: 10,
      mortality_comment: '',
      proximate_cause_of_death_id: '',
      proximate_cause_of_death_confidence: '',
      proximate_predated_by_taxon_id: '',
      ultimate_cause_of_death_id: '',
      ultimate_cause_of_death_confidence: '',
      ultimate_predated_by_taxon_id: '',
      projection_mode: 'wgs' as ProjectionMode,
      mortality_id: undefined,
      location_id: undefined
    }),
    dialogTitle: 'Mortality',
    infoText: SurveyAnimalsI18N.animalMortalityHelp,
    mdiIcon: mdiSkullOutline
  },
  [SurveyAnimalsI18N.animalFamilyTitle]: {
    animalKeyName: 'family',
    addBtnText: 'Add Relationship',
    defaultFormValue: () => ({
      family_id: '',
      relationship: undefined
    }),
    dialogTitle: 'Family Relationship',
    infoText: SurveyAnimalsI18N.animalFamilyHelp,
    mdiIcon: mdiFamilyTree
  },
  [SurveyAnimalsI18N.animalCaptureTitle]: {
    animalKeyName: 'captures',
    addBtnText: 'Add Capture Event',
    defaultFormValue: () => ({
      capture_latitude: '' as unknown as number,
      capture_longitude: '' as unknown as number,
      capture_utm_northing: '' as unknown as number,
      capture_utm_easting: '' as unknown as number,
      capture_comment: '',
      capture_coordinate_uncertainty: 10,
      capture_timestamp: '' as unknown as Date,
      projection_mode: 'wgs' as ProjectionMode,
      show_release: false,
      release_latitude: '' as unknown as number,
      release_longitude: '' as unknown as number,
      release_utm_northing: '' as unknown as number,
      release_utm_easting: '' as unknown as number,
      release_comment: '',
      release_timestamp: '' as unknown as Date,
      release_coordinate_uncertainty: 10,
      capture_id: undefined,
      capture_location_id: undefined,
      release_location_id: undefined
    }),
    dialogTitle: 'Capture Event',
    infoText: SurveyAnimalsI18N.animalCaptureHelp,
    mdiIcon: mdiSpiderWeb
  },
  Telemetry: {
    animalKeyName: 'device',
    addBtnText: 'Add Device / Deployment',
    defaultFormValue: () => ({
      device_id: '' as unknown as number,
      device_make: '',
      frequency: '' as unknown as number,
      frequency_unit: '',
      device_model: '',
      deployments: [
        {
          deployment_id: '',
          attachment_start: '',
          attachment_end: undefined
        }
      ]
    }),
    dialogTitle: 'Device / Deployment',
    infoText: SurveyAnimalsI18N.telemetryDeviceHelp,
    mdiIcon: mdiAccessPoint
  }
};
