import { GridColDef, GridRowId } from '@mui/x-data-grid';
import { createContext, PropsWithChildren } from 'react';

export interface IHabitatFeatureRow {
  id: GridRowId;
  survey_habitat_feature_id: number;
  survey_id: number;
  habitat_feature_type_id: number;
  count: number;
  latitude: number | null;
  longitude: number | null;
  observed_date: string;
  observed_time: string;
  // TODO: Mac: Add the qualitative / quantitative arrays
}

export interface IHabitatFeatureTableContext {
  columns: GridColDef<IHabitatFeatureRow>[];
  rows: IHabitatFeatureRow[];
  rowCount: number;
  isLoading: boolean;
}

type IHabitatFeatureTableContextProviderProps = PropsWithChildren;

export const HabitatFeatureTableContext = createContext<IHabitatFeatureTableContext | undefined>(undefined);

/**
 * Provider for the Habitat Feature Table context.
 *
 * @param {IHabitatFeatureTableContextProviderProps} props
 * @returns {*}
 */
export const HabitatFeatureTableContextProvider = (props: IHabitatFeatureTableContextProviderProps) => {
  const columns: GridColDef<IHabitatFeatureRow>[] = [
    {
      field: 'habitat_feature_type_id',
      headerName: 'Habitat Feature',
      align: 'left',
      maxWidth: 200,
      valueGetter: (params) => {
        return params.row.habitat_feature_type_id; // TODO: Mac: Replace this with the actual habitat feature name
      },
      flex: 1
    },
    {
      field: 'count',
      headerName: 'Count',
      headerAlign: 'right',
      align: 'right',
      maxWidth: 100,
      flex: 1
    },
    {
      field: 'latitude',
      headerName: 'Lat',
      headerAlign: 'right',
      align: 'right',
      maxWidth: 100
    },
    {
      field: 'longitude',
      headerName: 'Long',
      headerAlign: 'right',
      align: 'right',
      maxWidth: 100
    },
    {
      field: 'observed_date',
      headerName: 'Date',
      maxWidth: 120
    },
    {
      field: 'observed_time',
      headerName: 'Time',
      headerAlign: 'right',
      align: 'right',
      maxWidth: 100
    }
    // TODO: Mac: Dynamically add the qualitative / quantitative columns
  ];

  // TODO: Implement the context with the actual data
  const habitatFeatureTableContxt: IHabitatFeatureTableContext = {
    columns: columns,
    rows: [],
    rowCount: -1,
    isLoading: false
  };

  return (
    <HabitatFeatureTableContext.Provider value={habitatFeatureTableContxt}>
      {props.children}
    </HabitatFeatureTableContext.Provider>
  );
};
