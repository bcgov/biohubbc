import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from 'react';

const AnimalFormContext = createContext<
  { data: IAnimalFormData; updateData: Dispatch<SetStateAction<IAnimalFormData>> } | undefined
>(undefined);

interface IAnimalMarkings {
  id: string;
}

interface IAnimalMeasurements {
  id: string;
}

type IAnimalFormData = Partial<{
  markings: IAnimalMarkings[];
  measurements: IAnimalMeasurements[];
}>;

interface AnimalFormProviderProps {
  children: ReactNode;
}

const AnimalFormProvider = ({ children }: AnimalFormProviderProps) => {
  const [data, updateData] = useState<IAnimalFormData>({});
  return <AnimalFormContext.Provider value={{ data, updateData }}>{children}</AnimalFormContext.Provider>;
};

const useAnimalFormData = () => {
  const context = useContext(AnimalFormContext);

  if (!context) {
    throw new Error('useAnimalFormData must be a child of AnimalFormProvider');
  }

  return context;
};

export { AnimalFormProvider, useAnimalFormData };
