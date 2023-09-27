import { GridRowModelUpdate, useGridApiRef } from '@mui/x-data-grid';
import { GridApiCommunity } from '@mui/x-data-grid/internals';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { createContext, PropsWithChildren, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { SurveyContext } from './surveyContext';

export interface IObservationRecord {
  survey_observation_id: number | undefined;
  wldtaxonomic_units_id: number | undefined;
  samplingSite: string | undefined;
  samplingMethod: string | undefined;
  samplingPeriod: string | undefined;
  count: number | undefined;
  observation_date: Date | undefined;
  observation_time: string | undefined;
  latitude: number | undefined;
  longitude: number | undefined;
}

export interface IObservationTableRow extends Partial<IObservationRecord> {
  id: string;
}

// TODO remove when finished testing
export const fetchObservationDemoRows = async (): Promise<IObservationRecord[]> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve([
        {
          survey_observation_id: 1,
          wldtaxonomic_units_id: 1111,
          samplingSite: 'Site 1',
          samplingMethod: 'Method 1',
          samplingPeriod: undefined,
          count: 1,
          observation_date: new Date('2020-01-01'),
          observation_time: '12:00:00',
          latitude: 45,
          longitude: 125
        },
        {
          survey_observation_id: 2,
          wldtaxonomic_units_id: 1111,
          samplingSite: 'Site 1',
          samplingMethod: 'Method 1',
          samplingPeriod: undefined,
          count: 2,
          observation_date: new Date('2021-01-01'),
          observation_time: '13:00:00',
          latitude: 46,
          longitude: 126
        },
        {
          survey_observation_id: 3,
          wldtaxonomic_units_id: 1111,
          samplingSite: 'Site 1',
          samplingMethod: 'Method 1',
          samplingPeriod: undefined,
          count: 3,
          observation_date: new Date('2022-01-01'),
          observation_time: '14:00:00',
          latitude: 47,
          longitude: 127
        }
      ]);
    }, 1000 * (Math.random() + 1));
  });
};

/**
 * Context object that stores information about survey observations
 *
 * @export
 * @interface IObservationsContext
 */
export type IObservationsContext = {
  createNewRecord: () => void;
  saveRecords: () => Promise<void>;
  revertRecords: () => Promise<void>;
  refreshRecords: () => Promise<void>;
  _muiDataGridApiRef: React.MutableRefObject<GridApiCommunity>;
};

export const ObservationsContext = createContext<IObservationsContext>({
  _muiDataGridApiRef: { current: null as unknown as GridApiCommunity },
  createNewRecord: () => {},
  revertRecords: () => Promise.resolve(),
  saveRecords: () => Promise.resolve(),
  refreshRecords: () => Promise.resolve()
});

export const ObservationsContextProvider = (props: PropsWithChildren<Record<never, any>>) => {
  const _muiDataGridApiRef = useGridApiRef();
  const biohubApi = useBiohubApi();
  const surveyContext = useContext(SurveyContext);

  const createNewRecord = () => {
    const id = uuidv4();

    _muiDataGridApiRef.current.updateRows([
      {
        id,
        survey_observation_id: null,
        wldtaxonomic_units: undefined,
        samplingSite: undefined,
        samplingMethod: undefined,
        samplingPeriod: undefined,
        count: undefined,
        observation_date: undefined,
        observation_time: undefined,
        lat: undefined,
        long: undefined
      } as GridRowModelUpdate
    ]);

    _muiDataGridApiRef.current.startRowEditMode({ id, fieldToFocus: 'wldtaxonomic_units' });
  };

  const _getRows = (): IObservationTableRow[] => {
    return Array.from(_muiDataGridApiRef.current.getRowModels?.()?.values()) as IObservationTableRow[]
  }

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


  const saveRecords = async () => {
    const editingIds = Object.keys(_muiDataGridApiRef.current.state.editRows);
    editingIds.forEach((id) => _muiDataGridApiRef.current.stopRowEditMode({ id }));

    const { projectId, surveyId } = surveyContext;
    
    const rows = getActiveRecords() // _getRows()

    const updatedRows = await biohubApi.observation.insertUpdateObservationRecords(projectId, surveyId, rows);
    _muiDataGridApiRef.current.setRows(updatedRows.map((row: IObservationTableRow) => ({
      ...row,
      id: String(row.survey_observation_id)
    })));
  };

  const revertRecords = async () => {
    const editingIds = Object.keys(_muiDataGridApiRef.current.state.editRows);
    editingIds.forEach((id) => _muiDataGridApiRef.current.stopRowEditMode({ id, ignoreModifications: true }));
  };

  const refreshRecords = async () => {
    //
  };

  const observationsContext: IObservationsContext = {
    createNewRecord,
    revertRecords,
    saveRecords,
    refreshRecords,
    _muiDataGridApiRef
  };

  return <ObservationsContext.Provider value={observationsContext}>{props.children}</ObservationsContext.Provider>;
};
