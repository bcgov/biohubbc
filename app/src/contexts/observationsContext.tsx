import { useGridApiRef } from '@mui/x-data-grid';
import { GridApiCommunity } from '@mui/x-data-grid/internals';
import { createContext, PropsWithChildren } from 'react';
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
  _muiDataGridApiRef: React.MutableRefObject<GridApiCommunity>
}

export const ObservationsContext = createContext<IObservationsContext>({
  _muiDataGridApiRef: { current: null as unknown as GridApiCommunity },
  createNewRecord: () => {},
});

export const ObservationsContextProvider = (props: PropsWithChildren<Record<never, any>>) => {
  const _muiDataGridApiRef = useGridApiRef();

  const createNewRecord = () => {
    const id = uuidv4();

    _muiDataGridApiRef.current.updateRows([
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

    _muiDataGridApiRef.current.startRowEditMode({ id, fieldToFocus: 'speciesName' });
  };

  const observationsContext: IObservationsContext = {
    createNewRecord,
    _muiDataGridApiRef
  };

  return (
    <ObservationsContext.Provider value={observationsContext}>
      {props.children}
    </ObservationsContext.Provider>
    );
};
