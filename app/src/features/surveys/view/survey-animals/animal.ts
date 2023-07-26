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

interface IAnimal {
  general: IAnimalGeneral;
  capture: IAnimalCapture[];
  marking: IAnimalMarking[];
  measurement: IAnimalMeasurement[];
  mortality: IAnimalMortality;
  family: IAnimalRelationship[];
  image: IAnimalImage[];
  device: IAnimalTelemetryDevice;
}

type IAnimalKey = keyof IAnimal;

type IAnimalFormData = Partial<IAnimal>;

export type { IAnimal, IAnimalKey, IAnimalFormData };
