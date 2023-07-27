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

export interface IAnimalCapture {
  capture_longitude: number;
  capture_latitude: number;
  capture_timestamp: Date;
  capture_comment?: string;
  release_longitude?: number;
  release_latitude?: number;
  release_timestamp?: Date;
  release_comment?: string;
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

export interface IAnimalTelemetryDevice {
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

export type IAnimalAttribute = IAnimal[IAnimalKey];

export type IAnimalKey = keyof IAnimal;
