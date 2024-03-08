import { IDetailedCritterWithInternalId } from 'interfaces/useSurveyApi.interface';
import { ANIMAL_FORM_MODE } from '../animal';

export type AnimalFormProps<T> =
  | {
      formObject?: T;
      formMode: ANIMAL_FORM_MODE.ADD;
      open: boolean;
      handleClose: () => void;
      critter: IDetailedCritterWithInternalId;
    }
  | {
      formObject: T;
      formMode: ANIMAL_FORM_MODE.EDIT;
      open: boolean;
      handleClose: () => void;
      critter: IDetailedCritterWithInternalId;
    };
