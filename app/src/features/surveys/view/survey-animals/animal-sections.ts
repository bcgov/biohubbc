import { SurveyAnimalsI18N } from 'constants/i18n';
import { v4 } from 'uuid';
import { IAnimal, ProjectionMode } from './animal';
import CaptureAnimalForm from './form-sections/CaptureAnimalForm';
import GeneralAnimalForm from './form-sections/GeneralAnimalForm';

export type IAnimalSections =
  | 'General'
  // | 'Ecological Units'
  // | 'Markings'
  // | 'Measurements'
  | 'Capture Information';
// | 'Mortality'
// | 'Family'
//| 'Observations'
//'Telemetry';

// Remove partial once complete
type IAnimalSectionsMap = Record<
  IAnimalSections,
  {
    title: IAnimalSections;
    comp: () => JSX.Element;
    animalKeyName: keyof IAnimal;
    defaultFormValue?: object;
  }
>;
export const ANIMAL_SECTIONS_MAP: IAnimalSectionsMap = {
  [SurveyAnimalsI18N.animalGeneralTitle]: {
    title: SurveyAnimalsI18N.animalGeneralTitle,
    comp: GeneralAnimalForm,
    animalKeyName: 'general'
  },
  [SurveyAnimalsI18N.animalCaptureTitle]: {
    title: SurveyAnimalsI18N.animalCaptureTitle,
    comp: CaptureAnimalForm,
    animalKeyName: 'captures',
    defaultFormValue: {
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
    }
  }
};
