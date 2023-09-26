import { useGridApiRef } from '@mui/x-data-grid';
import { GridApiCommunity } from '@mui/x-data-grid/internals';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { createContext, PropsWithChildren, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { SurveyContext } from './surveyContext';

export interface IObservationRecord {
  observation_id: number | undefined;
  speciesName: string | undefined;
  samplingSite: string | undefined;
  samplingMethod: string | undefined;
  samplingPeriod: string | undefined;
  count: number | undefined;
  date: Date | undefined;
  time: string | undefined;
  latitude: number | undefined;
  longitude: number | undefined;
}

export interface IObservationTableRow extends Partial<IObservationRecord> {
  id: string;
}

export const fetchObservationDemoRows = async (): Promise<IObservationRecord[]> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve([
        {
          observation_id: 1,
          speciesName: 'Moose (Alces Americanus)',
          samplingSite: 'Site 1',
          samplingMethod: 'Method 1',
          samplingPeriod: undefined,
          count: 1,
          date: new Date('2020-01-01'),
          time: '12:00:00',
          latitude: 45,
          longitude: 125
        },
        {
          observation_id: 2,
          speciesName: 'Moose (Alces Americanus)',
          samplingSite: 'Site 1',
          samplingMethod: 'Method 1',
          samplingPeriod: undefined,
          count: 2,
          date: new Date('2021-01-01'),
          time: '13:00:00',
          latitude: 46,
          longitude: 126
        },
        {
          observation_id: 3,
          speciesName: 'Moose (Alces Americanus)',
          samplingSite: 'Site 1',
          samplingMethod: 'Method 1',
          samplingPeriod: undefined,
          count: 3,
          date: new Date('2022-01-01'),
          time: '14:00:00',
          latitude: 47,
          longitude: 127
        }
      ])
    }, 1000 * (Math.random() + 1));
  })
}

/**
 * Context object that stores information about survey observations
 *
 * @export
 * @interface IObservationsContext
 */
export type IObservationsContext = {
  createNewRecord: () => void;
  // getActiveRecords: () => IObservationTableRow[];
  saveRecords: () => Promise<void>;
  revertRecords: () => Promise<void>;
  refreshRecords: () => Promise<void>;
  _muiDataGridApiRef: React.MutableRefObject<GridApiCommunity>
}

export const ObservationsContext = createContext<IObservationsContext>({
  _muiDataGridApiRef: { current: null as unknown as GridApiCommunity },
  createNewRecord: () => {},
  // getActiveRecords: () => [],
  revertRecords: () => Promise.resolve(),
  saveRecords: () => Promise.resolve(),
  refreshRecords: () => Promise.resolve()
});

export const ObservationsContextProvider = (props: PropsWithChildren<Record<never, any>>) => {
  const _muiDataGridApiRef = useGridApiRef();
  const biohubApi = useBiohubApi();
  const surveyContext = useContext(SurveyContext);

  /*
  const _getRows = (): IObservationTableRow[] => {
    return Array.from(_muiDataGridApiRef.current.getRowModels?.()?.values()) as IObservationTableRow[]
  }
  */ 

  const createNewRecord = () => {
    const id = uuidv4();

    _muiDataGridApiRef.current.updateRows([
      {
        id,
        observation_id: null,
        speciesName: undefined,
        samplingSite: undefined,
        samplingMethod: undefined,
        samplingPeriod: undefined,
        count: undefined,
        date: undefined,
        time: undefined,
        lat: undefined,
        long: undefined
      }
    ]);

    _muiDataGridApiRef.current.startRowEditMode({ id, fieldToFocus: 'speciesName' });
  };

  /*
  const getActiveRecords = (): IObservationTableRow[] => {
    return _getRows().map((row) => {
      const editRow = _muiDataGridApiRef.current.state.editRows[row.id]
      if (!editRow) {
        return row;
      }

      return Object
        .entries(editRow)
        .reduce((newRow, entry) => ({ ...row, ...newRow, _isModified: true, [entry[0]]: entry[1].value }), {});
    }) as IObservationTableRow[];
  }
  */

  const saveRecords = async () => {
    const editingIds = Object.keys(_muiDataGridApiRef.current.state.editRows)
    editingIds.forEach((id) => _muiDataGridApiRef.current.stopRowEditMode({ id }));

    const { projectId, surveyId } = surveyContext;
    const rows = Array.from(_muiDataGridApiRef.current.getRowModels?.()?.values()) as IObservationTableRow[]

    return biohubApi.observation.insertUpdateObservationRecords(projectId, surveyId, rows)
  }

  const revertRecords = async () => {
    const editingIds = Object.keys(_muiDataGridApiRef.current.state.editRows)
    editingIds.forEach((id) => _muiDataGridApiRef.current.stopRowEditMode({ id, ignoreModifications: true }));
  }

  const refreshRecords = async () => {
    //
  }

  const observationsContext: IObservationsContext = {
    createNewRecord,
    // getActiveRecords,
    revertRecords,
    saveRecords,
    refreshRecords,
    _muiDataGridApiRef
  };

  return (
    <ObservationsContext.Provider value={observationsContext}>
      {props.children}
    </ObservationsContext.Provider>
    );
};
