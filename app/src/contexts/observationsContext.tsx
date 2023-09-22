import { useGridApiRef } from '@mui/x-data-grid';
import { GridApiCommunity } from '@mui/x-data-grid/internals';
import { createContext, PropsWithChildren } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface IObservationRecord {
  observation_id: number | undefined;
  speciesName: string | undefined;
  samplingSite: string | undefined;
  samplingMethod: string | undefined;
  samplingPeriod: string | undefined;
  count: number | undefined;
  date: string | undefined;
  time: string | undefined;
  lat: number | undefined;
  long: number | undefined;
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
          count: undefined,
          date: undefined,
          time: undefined,
          lat: undefined,
          long: undefined
        },
        {
          observation_id: 2,
          speciesName: 'Moose (Alces Americanus)',
          samplingSite: 'Site 1',
          samplingMethod: 'Method 1',
          samplingPeriod: undefined,
          count: undefined,
          date: undefined,
          time: undefined,
          lat: undefined,
          long: undefined
        },
        {
          observation_id: 3,
          speciesName: 'Moose (Alces Americanus)',
          samplingSite: 'Site 1',
          samplingMethod: 'Method 1',
          samplingPeriod: undefined,
          count: undefined,
          date: undefined,
          time: undefined,
          lat: undefined,
          long: undefined
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

    /*
    const rows = getActiveRecords()
      .map((row) => ({ ...row, _isModified: false }))

    console.log(rows);
    localStorage.setItem('__OBSERVATIONS_TEST', JSON.stringify(rows))
    return Promise.resolve()
    */
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
