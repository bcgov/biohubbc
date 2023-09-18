import { mdiDotsVertical, mdiPlus } from "@mdi/js";
import Icon from "@mdi/react";
import { Theme } from "@mui/material";
import IconButton from '@mui/material/IconButton';
import { makeStyles } from "@mui/styles";
import { DataGrid, GridColDef, GridEventListener } from '@mui/x-data-grid';
import { IObservationTableRow, ObservationsContext } from "contexts/observationsContext";
import { useContext } from "react";
// import { useEffect, useState } from "react";
import { pluralize as p } from "utils/Utils";

export type IObservationsTableProps = Record<never, any>;

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
  /*
  {
    field: '_isModified',
    type: 'boolean'
  }
  */
];

const ObservationsTable = (props: IObservationsTableProps) => {
  const classes = useStyles();
  
  const { _rows } = useContext(ObservationsContext);

  
  const handleRowEditStop: GridEventListener<'rowEditStop'> = (_params, event) => {
    event.defaultMuiPrevented = true;
  };

  const numModified = _rows.filter((row) => row._isModified).length;

  return (
    <DataGrid
      onRowEditStop={handleRowEditStop}
      processRowUpdate={(newRow, oldRow) => ({ ...newRow, _isModified: true })}
      columns={observationColumns}
      rows={_rows}
      localeText={{
        noRowsLabel: "No Records",
        footerRowSelected: (numSelected: number) => {
          return [
            numSelected > 0 && `${numSelected} ${p(numSelected, 'row')} selected`,
            numModified > 0 && `${numModified} unsaved ${p(numModified, 'row')}`
          ].filter(Boolean).join(', ')
        }
      }}
      getRowClassName={(params) => params.row._isModified ? classes.modifiedRow : ''}
      
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
