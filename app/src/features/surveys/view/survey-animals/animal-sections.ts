import {
  mdiAccessPoint,
  mdiFamilyTree,
  mdiHomeGroup,
  mdiPencil,
  mdiRuler,
  mdiSkull,
  mdiSpiderWeb,
  mdiTag
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
  | 'Capture Information'
  | 'Mortality'
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
      mdiIcon: string;
    }
  > {
  [SurveyAnimalsI18N.animalGeneralTitle]: {
    animalKeyName: 'general';
    //This probably needs to change to the correct object, general does not use the formikArray pattern
    defaultFormValue: () => object;
    addBtnText?: string;
    mdiIcon: string;
  };
  [SurveyAnimalsI18N.animalCollectionUnitTitle]: {
    animalKeyName: 'collectionUnits';
    defaultFormValue: () => IAnimalCollectionUnit;
    addBtnText: string;
    mdiIcon: string;
  };
  [SurveyAnimalsI18N.animalMarkingTitle]: {
    animalKeyName: 'markings';
    defaultFormValue: () => IAnimalMarking;
    addBtnText: string;
    mdiIcon: string;
  };
  [SurveyAnimalsI18N.animalMeasurementTitle]: {
    animalKeyName: 'measurements';
    defaultFormValue: () => IAnimalMeasurement;
    addBtnText: string;
    mdiIcon: string;
  };
  [SurveyAnimalsI18N.animalCaptureTitle]: {
    animalKeyName: 'captures';
    defaultFormValue: () => IAnimalCapture;
    addBtnText: string;
    mdiIcon: string;
  };
  [SurveyAnimalsI18N.animalMortalityTitle]: {
    animalKeyName: 'mortality';
    defaultFormValue: () => IAnimalMortality;
    addBtnText: string;
    mdiIcon: string;
  };
  [SurveyAnimalsI18N.animalFamilyTitle]: {
    animalKeyName: 'family';
    defaultFormValue: () => IAnimalRelationship;
    addBtnText: string;
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
    mdiIcon: mdiPencil
  },
  [SurveyAnimalsI18N.animalCollectionUnitTitle]: {
    animalKeyName: 'collectionUnits',
    addBtnText: 'Add Unit',
    defaultFormValue: () => ({
      _id: v4(),
      collection_unit_id: '',
      collection_category_id: '',
      critter_collection_unit_id: undefined
    }),
    mdiIcon: mdiHomeGroup
  },
  [SurveyAnimalsI18N.animalMarkingTitle]: {
    animalKeyName: 'markings',
    addBtnText: 'Add Marking',
    defaultFormValue: () => ({
      _id: v4(),

      marking_type_id: '',
      taxon_marking_body_location_id: '',
      primary_colour_id: '',
      secondary_colour_id: '',
      marking_comment: '',
      marking_id: undefined
    }),
    mdiIcon: mdiTag
  },
  [SurveyAnimalsI18N.animalMeasurementTitle]: {
    animalKeyName: 'measurements',
    addBtnText: 'Add Measurement',
    defaultFormValue: () => ({
      _id: v4(),
      measurement_qualitative_id: undefined,
      measurement_quantitative_id: undefined,
      taxon_measurement_id: '',
      value: '' as unknown as number,
      qualitative_option_id: '',
      measured_timestamp: '' as unknown as Date,
      measurement_comment: ''
    }),
    mdiIcon: mdiRuler
  },
  [SurveyAnimalsI18N.animalMortalityTitle]: {
    animalKeyName: 'mortality',
    addBtnText: 'Add Mortality',
    defaultFormValue: () => ({
      _id: v4(),

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
    mdiIcon: mdiSkull
  },
  [SurveyAnimalsI18N.animalFamilyTitle]: {
    animalKeyName: 'family',
    addBtnText: 'Add Relationship',
    defaultFormValue: () => ({
      _id: v4(),

      family_id: '',
      relationship: undefined
    }),
    mdiIcon: mdiFamilyTree
  },
  [SurveyAnimalsI18N.animalCaptureTitle]: {
    animalKeyName: 'captures',
    addBtnText: 'Add Capture',
    defaultFormValue: () => ({
      _id: v4(),

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
    mdiIcon: mdiAccessPoint
  }
};
