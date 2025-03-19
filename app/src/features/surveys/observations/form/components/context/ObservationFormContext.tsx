import {
  CBQualitativeMeasurementTypeDefinition,
  CBQuantitativeMeasurementTypeDefinition
} from 'interfaces/useCritterApi.interface';
import {
  EnvironmentQualitativeTypeDefinition,
  EnvironmentQuantitativeTypeDefinition
} from 'interfaces/useReferenceApi.interface';
import React, { createContext, PropsWithChildren, useMemo, useState } from 'react';

export interface IObservationFormContext {
  quantitativeEnvironmentTypeDefinitions: EnvironmentQuantitativeTypeDefinition[];
  setQuantitativeEnvironmentTypeDefinitions: React.Dispatch<
    React.SetStateAction<EnvironmentQuantitativeTypeDefinition[]>
  >;
  qualitativeEnvironmentTypeDefinitions: EnvironmentQualitativeTypeDefinition[];
  setQualitativeEnvironmentTypeDefinitions: React.Dispatch<
    React.SetStateAction<EnvironmentQualitativeTypeDefinition[]>
  >;
  quantitativeSubcountMeasurementTypeDefinitions: CBQuantitativeMeasurementTypeDefinition[];
  setQuantitativeSubcountMeasurementTypeDefinitions: React.Dispatch<
    React.SetStateAction<CBQuantitativeMeasurementTypeDefinition[]>
  >;
  qualitativeSubcountMeasurementTypeDefinitions: CBQualitativeMeasurementTypeDefinition[];
  setQualitativeSubcountMeasurementTypeDefinitions: React.Dispatch<
    React.SetStateAction<CBQualitativeMeasurementTypeDefinition[]>
  >;
}

export const ObservationFormContext = createContext<IObservationFormContext | undefined>(undefined);

export const ObservationFormContextProvider = (props: PropsWithChildren<Record<never, any>>) => {
  const [quantitativeEnvironmentTypeDefinitions, setQuantitativeEnvironmentTypeDefinitions] = useState<
    EnvironmentQuantitativeTypeDefinition[]
  >([]);
  const [qualitativeEnvironmentTypeDefinitions, setQualitativeEnvironmentTypeDefinitions] = useState<
    EnvironmentQualitativeTypeDefinition[]
  >([]);
  const [quantitativeSubcountMeasurementTypeDefinitions, setQuantitativeSubcountMeasurementTypeDefinitions] = useState<
    CBQuantitativeMeasurementTypeDefinition[]
  >([]);
  const [qualitativeSubcountMeasurementTypeDefinitions, setQualitativeSubcountMeasurementTypeDefinitions] = useState<
    CBQualitativeMeasurementTypeDefinition[]
  >([]);

  const contextValue: IObservationFormContext = useMemo(() => {
    return {
      quantitativeEnvironmentTypeDefinitions,
      setQuantitativeEnvironmentTypeDefinitions,
      qualitativeEnvironmentTypeDefinitions,
      setQualitativeEnvironmentTypeDefinitions,
      quantitativeSubcountMeasurementTypeDefinitions,
      setQuantitativeSubcountMeasurementTypeDefinitions,
      qualitativeSubcountMeasurementTypeDefinitions,
      setQualitativeSubcountMeasurementTypeDefinitions
    };
  }, [
    qualitativeEnvironmentTypeDefinitions,
    qualitativeSubcountMeasurementTypeDefinitions,
    quantitativeEnvironmentTypeDefinitions,
    quantitativeSubcountMeasurementTypeDefinitions
  ]);

  return <ObservationFormContext.Provider value={contextValue}>{props.children}</ObservationFormContext.Provider>;
};
