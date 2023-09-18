import { GridRowModes, GridRowModesModel } from '@mui/x-data-grid';
import useDataLoader from 'hooks/useDataLoader';
import { createContext, PropsWithChildren, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface IObservationRecord {
  observation_id: number;
  speciesName: string;
  samplingSite: string;
  samplingMethod: string;
  samplingPeriod: string;
  count?: number;
  date?: string;
  time?: string;
  lat?: number;
  long?: number;
}

export interface IObservationTableRow extends Omit<IObservationRecord, 'observation_id'> {
  id: string;
  observation_id: number | null;
  _isModified: boolean;
}

export const fetchObservationDemoRows = async (): Promise<IObservationRecord[]> => {
  await setTimeout(() => {}, 100 * (Math.random() + 1));
  return [
    {
      observation_id: 1,
      speciesName: 'Moose (Alces Americanus)',
      samplingSite: 'Site 1',
      samplingMethod: 'Method 1',
      samplingPeriod: '',
    },
    {
      observation_id: 2,
      speciesName: 'Moose (Alces Americanus)',
      samplingSite: 'Site 1',
      samplingMethod: 'Method 1',
      samplingPeriod: '',
    },
    {
      observation_id: 3,
      speciesName: 'Moose (Alces Americanus)',
      samplingSite: 'Site 1',
      samplingMethod: 'Method 1',
      samplingPeriod: '',
    }
  ]
}

/**
 * Context object that stores information about survey observations
 *
 * @export
 * @interface IObservationsContext
 */
export type IObservationsContext = {
  createNewRecord: () => void;
  _rows: IObservationTableRow[]
  _rowModesModel: GridRowModesModel;
  _setRows: any // (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
  _setRowModesModel: (
    newModel: (oldModel: GridRowModesModel) => GridRowModesModel,
  ) => void;
}

export const ObservationsContext = createContext<IObservationsContext>({
  _rows: [],
  _rowModesModel: {},
  _setRows: () => {},
  _setRowModesModel: () => {},
  createNewRecord: () => {},

});

export const ObservationsContextProvider = (props: PropsWithChildren<Record<never, any>>) => {
  const [_rows, _setRows] = useState<IObservationTableRow[]>([]);
  const [_rowModesModel, _setRowModesModel] = useState<GridRowModesModel>({});

  const observationsDataLoader = useDataLoader(fetchObservationDemoRows);
  observationsDataLoader.load()

  const createNewRecord = () => {
    const id = uuidv4();

    _setRows((oldRows) => [
      ...oldRows,
      {
        id,
        _isModified: true,
        observation_id: null,
        speciesName: '',
        samplingSite: '',
        samplingMethod: '',
        samplingPeriod: '',
      }
    ]);

    _setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: 'speciesName' },
    }));
  };

  const observationsContext: IObservationsContext = {
    createNewRecord,
    _rows,
    _rowModesModel,
    _setRows,
    _setRowModesModel
  };

  return (
    <ObservationsContext.Provider value={observationsContext}>
      {props.children}
    </ObservationsContext.Provider>
    );
};
