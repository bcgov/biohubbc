import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useReducer, useState } from 'react';

interface IAnimalMarking {
  id: string;
}

interface IAnimalMeasurement {
  id: string;
}

interface IAnimalCapture {
  id: string;
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

interface IAnimal {
  capture: IAnimalCapture[];
  marking: IAnimalMarking[];
  measurement: IAnimalMeasurement[];
  mortality: IAnimalMortality;
  family: IAnimalRelationship[];
  image: IAnimalImage[];
  device: IAnimalTelemetryDevice;
}

type IAnimalFormData = Partial<IAnimal>;

enum eAnimalAction {
  CAPTURE,
  MARKING,
  MEASUREMENT,
  MORTALITY,
  FAMILY,
  IMAGE,
  DEVICE
}

interface IAnimalAction {
  type: eAnimalAction;
  payload:
    | IAnimalMarking
    | IAnimalMeasurement
    | IAnimalCapture
    | IAnimalMortality
    | IAnimalRelationship
    | IAnimalTelemetryDevice
    | IAnimalImage;
  operation: 'ADD' | 'REMOVE';
  removeIndex?: number;
}

const animalReducer = (state: IAnimalFormData, action: IAnimalAction): IAnimalFormData => {
  const { type, payload, operation } = action;
  const isRemove = operation === 'REMOVE';
  switch (type) {
    case eAnimalAction.CAPTURE:
      return isRemove ? { ...state, capture: [payload] } : { ...state, capture: [payload] };
    default:
      return state;
  }
};

const AnimalFormContext = createContext<{ data: IAnimalFormData; updateAnimal: Dispatch<IAnimalAction> } | undefined>(
  undefined
);

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
    <AnimalFormContext.Provider value={{ data: state, updateAnimal: dispatch }}>{children}</AnimalFormContext.Provider>
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
