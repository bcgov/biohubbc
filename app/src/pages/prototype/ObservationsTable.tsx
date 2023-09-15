import { mdiDotsVertical } from "@mdi/js";
import Icon from "@mdi/react";
import { Theme } from "@mui/material";
import IconButton from '@mui/material/IconButton';
import { makeStyles } from "@mui/styles";
import { DataGrid, GridColDef } from '@mui/x-data-grid';

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
  isModified: boolean;
}

export type IObservationsTableProps = {
  observations: IObservationTableRow[]
  onChangeObservations: (observations: IObservationTableRow[]) => void
}

const useStyles = makeStyles((theme: Theme) => ({
  modifiedRow: {} // { background: 'rgba(65, 168, 3, 0.16)' }
}));

export const observationColumns: GridColDef<IObservationTableRow>[] = [
  {
    field: 'speciesName',
    headerName: 'Species',
    editable: true,
    flex: 1,
    minWidth: 250,
    disableColumnMenu: true
  },
  {
    field: 'samplingSite',
    headerName: 'Sampling Site',
    editable: true,
    type: 'singleSelect',
    valueOptions: ['Site 1', 'Site 2', 'Site 3', 'Site 4'],
    flex: 1,
    minWidth: 200,
    disableColumnMenu: true
  },
  {
    field: 'samplingMethod',
    headerName: 'Sampling Method',
    editable: true,
    type: 'singleSelect',
    valueOptions: ['Method 1', 'Method 2', 'Method 3', 'Method 4'],
    flex: 1,
    minWidth: 200,
    disableColumnMenu: true
  },
  {
    field: 'samplingPeriod',
    headerName: 'Sampling Period',
    editable: true,
    type: 'singleSelect',
    valueOptions: ['Period 1', 'Period 2', 'Period 3', 'Period 4', 'Undefined'],
    flex: 1,
    minWidth: 200,
    disableColumnMenu: true
  },
  {
    field: 'count',
    headerName: 'Count',
    editable: true,
    type: 'number',
    minWidth: 100,
    disableColumnMenu: true,
  },
  {
    field: 'date',
    headerName: 'Date',
    editable: true,
    type: 'date',
    minWidth: 150,
    disableColumnMenu: true,
  },
  {
    field: 'time',
    headerName: 'Time',
    editable: true,
    type: 'time',
    width: 150,
    disableColumnMenu: true
  },
  {
    field: 'lat',
    headerName: 'Lat',
    type: 'number',
    editable: true,
    width: 150,
    disableColumnMenu: true
  },
  {
    field: 'long',
    headerName: 'Long',
    type: 'number',
    editable: true,
    width: 150,
    disableColumnMenu: true
  },
  {
    field: 'actions',
    headerName: '',
    type: 'actions',
    width: 80,
    disableColumnMenu: true,
    resizable: false,
    cellClassName: 'test',
    getActions: () => [
      <IconButton>
        <Icon path={mdiDotsVertical} size={1} />
      </IconButton>
    ],
  },
  {
    field: 'isModified',
    type: 'boolean'
  }
]

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

const ObservationsTable = (props: IObservationsTableProps) => {
  const classes = useStyles();

  // const handleChangeState = (params: any) => {
  //   // props.onChangeObservations(Object.values(params.rows.dataRowIdToModelLookup));
  // }

  const numModified = props.observations.filter((row) => row.isModified).length;

  return (
    <DataGrid
      onRowEditStop={(params) => console.log('Edit stop', params)}
      onRowEditStart={(params) => console.log('Edit start', params)}
      onRowEditCommit={(params) => console.log('Edit commit', params)}
      processRowUpdate={(newRow, oldRow) => ({ ...newRow, isModified: true })}
      columns={observationColumns}
      rows={props.observations}
      localeText={{
        noRowsLabel: "No Records",
        footerRowSelected: (numSelected: number) => {
          return [
            numSelected > 0 && `${numSelected} rows selected`,
            numModified > 0 && `${numModified} unsaved changes`
          ].filter(Boolean).join(', ')
        }
      }}
      getRowClassName={(params) => params.row.isModified ? classes.modifiedRow : ''}
      
      // onStateChange={handleChangeState}
      sx={{
        background: '#fff',
        border: 'none',
        '& .MuiDataGrid-pinnedColumns, .MuiDataGrid-pinnedColumnHeaders': {
          background: '#fff'
        },
        '& .MuiDataGrid-columnHeaderTitle': {
          fontWeight: 700,
          textTransform: 'uppercase',
          color: '#999'
        },
        '& .test': {
          position: 'sticky',
          right: 0,
          top: 0,
          borderLeft: '1px solid #ccc',
          background: '#fff'
        },
        '& .MuiDataGrid-columnHeaders': {
          position: 'relative'
        },
        '& .MuiDataGrid-columnHeaders:after': {
          content: "''",
          position: 'absolute',
          right: 0,
          width: '79px',
          height: '80px',
          borderLeft: '1px solid #ccc',
          background: '#fff'
        }
      }}
    />
  )
}

export default ObservationsTable;
