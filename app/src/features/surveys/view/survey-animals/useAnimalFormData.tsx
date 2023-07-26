import { createContext, Dispatch, ReactNode, useContext, useReducer } from 'react';
interface IAnimalGeneral {
  taxon_id: string;
  taxon_label: string;
}

interface IAnimalMarking {
  id: string;
}

interface IAnimalMeasurement {
  id: string;
}

interface IAnimalCapture {
  capture_longitude?: number;
  capture_latitude?: number;
}

interface IAnimalMortality {
  id: string;
}

interface IAnimalRelationship {
  id: string;
}

interface IAnimalImage {
  id: string;
}

interface IAnimalTelemetryDevice {
  id: string;
}

export interface IAnimal {
  general: IAnimalGeneral;
  capture: IAnimalCapture[];
  marking: IAnimalMarking[];
  measurement: IAnimalMeasurement[];
  mortality: IAnimalMortality;
  family: IAnimalRelationship[];
  image: IAnimalImage[];
  device: IAnimalTelemetryDevice;
}

export type IAnimalKey = keyof IAnimal;

type IAnimalFormData = Partial<IAnimal>;

type IAnimalAction = {
  type: keyof IAnimal;
} & (
  | {
      operation: 'ADD';
      payload:
        | IAnimalMarking
        | IAnimalMeasurement
        | IAnimalCapture
        | IAnimalMortality
        | IAnimalRelationship
        | IAnimalTelemetryDevice
        | IAnimalImage;
    }
  | { operation: 'REMOVE'; payload: number }
);

const animalReducer = (state: IAnimalFormData, action: IAnimalAction): IAnimalFormData => {
  //const { type, operation } = action;
  //const isRemove = operation === 'REMOVE';
  //switch (type) {
  //  case 'capture':
  //    return isRemove ? { ...state } : { ...state, capture: [action.payload] };
  //  default:
  //    return state;
  //}
  return state;
};

const AnimalFormContext = createContext<
  { animalData: IAnimalFormData; updateAnimal: Dispatch<IAnimalAction> } | undefined
>(undefined);

interface AnimalFormProviderProps {
  children: ReactNode;
}

/**
 * Provides the animal data state to the children form elements.
 * params {AnimalFormProviderProps}
 *
 * returns {*}
 */

const AnimalFormProvider = ({ children }: AnimalFormProviderProps) => {
  const [state, dispatch] = useReducer(animalReducer, {});
  return (
    <AnimalFormContext.Provider value={{ animalData: state, updateAnimal: dispatch }}>
      {children}
    </AnimalFormContext.Provider>
  );
};

/**
 * custom hook to mutate animal form data.
 * Component must wrap with AnimalFormProvider to use this hook.
 *
 * returns animal data context
 */

const useAnimalFormData = () => {
  const context = useContext(AnimalFormContext);

  if (!context) {
    throw new Error('useAnimalFormData must be a child of AnimalFormProvider');
  }

  return context;
};

export { AnimalFormProvider, useAnimalFormData };
