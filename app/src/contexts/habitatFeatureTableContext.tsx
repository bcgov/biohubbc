import { GridColDef } from '@mui/x-data-grid';
import { createContext, PropsWithChildren } from 'react';

export interface IHabitatFeatureRow {
  survey_habitat_feature_id: number;
  survey_id: number;
  habitat_feature_id: number;
  count: number;
  latitude: number | null;
  longitude: number | null;
  observed_date: string;
  observed_time: string;
}

export interface IHabitatFeatureTableContext {
  columns: any[];
  rows: any[];
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
      field: 'habitat_feature_id',
      headerName: 'Habitat Feature',
      align: 'left',
      maxWidth: 200,
      valueGetter: (params) => {
        return params.row.habitat_feature_id; // TODO: Mac: Replace this with the actual habitat feature name
      }
    },
    {
      field: 'count',
      headerName: 'Count',
      headerAlign: 'right',
      align: 'right',
      maxWidth: 100
    },
    {
      field: 'latitude',
      headerName: 'Latitude', // TODO: Mac: Should this lat
      headerAlign: 'right',
      align: 'right',
      maxWidth: 100
    },
    {
      field: 'longitude',
      headerName: 'Longitude', // TODO: Mac: Should this be long
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
