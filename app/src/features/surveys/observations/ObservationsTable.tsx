import { mdiDotsVertical, mdiTrashCan } from '@mdi/js';
import Icon from '@mdi/react';
import IconButton from '@mui/material/IconButton';
import { DataGrid, GridColDef, GridEventListener, GridRowModelUpdate } from '@mui/x-data-grid';
import { IObservationTableRow, ObservationsContext } from 'contexts/observationsContext';
import { SurveyContext } from 'contexts/surveyContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import TaxonomyDataGridCell from 'components/data-grid/TaxonomyCell';
import TaxonomyDataGridEditCell from 'components/data-grid/TaxonomyDataGridEditCell';
import useDataLoader from 'hooks/useDataLoader';
import { useContext, useEffect, useState } from 'react';
// import { useEffect, useState } from "react";
// import { pluralize as p } from "utils/Utils";

export type IObservationsTableProps = Record<never, any>;

/*
const useStyles = makeStyles((theme: Theme) => ({
  modifiedRow: {} // { background: 'rgba(65, 168, 3, 0.16)' }
}));
*/

const ObservationsTable = (props: IObservationsTableProps) => {
  // const classes = useStyles();
  const biohubApi = useBiohubApi();
  const { projectId, surveyId } = useContext(SurveyContext);
  const observationsDataLoader = useDataLoader(() => biohubApi.observation.getObservationRecords(projectId, surveyId));
  const [initialRows, setInitialRows] = useState<IObservationTableRow[]>([]);

  observationsDataLoader.load();

  const observationColumns: GridColDef<IObservationTableRow>[] = [
    {
      field: 'speciesName',
      headerName: 'Species',
      editable: true,
      flex: 1,
      minWidth: 250,
      disableColumnMenu: true,
      renderCell: (params) => {
        return <TaxonomyDataGridCell dataGridProps={params} />;
      },
      renderEditCell: (params) => {
        return <TaxonomyDataGridEditCell dataGridProps={params} />;
      }
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
      disableColumnMenu: true
    },
    {
      field: 'observation_date',
      headerName: 'Date',
      editable: true,
      type: 'date',
      minWidth: 150,
      valueGetter: (params) => params.row.observation_date ? new Date(params.row.observation_date) : null,
      disableColumnMenu: true
    },
    {
      field: 'observation_date',
      headerName: 'Time',
      editable: true,
      type: 'time',
      width: 150,
      disableColumnMenu: true
    },
    {
      field: 'latitude',
      headerName: 'Lat',
      type: 'number',
      editable: true,
      width: 150,
      disableColumnMenu: true
    },
    {
      field: 'longitude',
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
      width: 96,
      disableColumnMenu: true,
      resizable: false,
      getActions: (params) => [
        <IconButton onClick={() => handleDeleteRow(params.id)}>
          <Icon path={mdiTrashCan} size={1} />
        </IconButton>,
        <IconButton>
          <Icon path={mdiDotsVertical} size={1} />
        </IconButton>
      ]
    }
  ];

  const apiRef = useContext(ObservationsContext)._muiDataGridApiRef;

  useEffect(() => {
    if (observationsDataLoader.data) {
      const rows: IObservationTableRow[] = observationsDataLoader.data.map((row: IObservationTableRow) => ({
        ...row,
        id: String(row.survey_observation_id),
        // TODO map wldtaxonomic_units code to speciesName
        // _isModified: false
      }));

      setInitialRows(rows);
    }
  }, [observationsDataLoader.data]);

  const handleDeleteRow = (id: string | number) => {
    apiRef.current.updateRows([{ id, _action: 'delete' } as GridRowModelUpdate]);
  };

  const handleRowEditStop: GridEventListener<'rowEditStop'> = (params, event) => {
    event.defaultMuiPrevented = true;
  };

  const handleCellClick: GridEventListener<'cellClick'> = (params, event) => {
    if (apiRef.current.state.editRows[params.row.id]) {
      return;
    }

    apiRef.current.startRowEditMode({ id: params.row.id, fieldToFocus: params.field });
  };

  /*
  const modifiedKeys = new Set<string>([
    ...Object.keys(apiRef.current.state.editRows),
    ...apiRef.current.get
  ]);
  */

  return (
    <DataGrid
      apiRef={apiRef}
      editMode="row"
      onCellClick={handleCellClick}
      // onRowEditStart={handleRowEditStart}
      onRowEditStop={handleRowEditStop}
      // processRowUpdate={handleProcessRowUpdate}
      columns={observationColumns}
      rows={initialRows}
      // rowModesModel={_rowModesModel}
      disableRowSelectionOnClick
      // onRowModesModelChange={_setRowModesModel}
      localeText={{
        noRowsLabel: 'No Records'
        /*
        footerRowSelected: (numSelected: number) => {
          return [
            numSelected > 0 && `${numSelected} ${p(numSelected, 'row')} selected`,
            numModified > 0 && `${numModified} unsaved ${p(numModified, 'row')}`
          ].filter(Boolean).join(', ')
        }
        */
      }}
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
          width: '96px',
          height: '80px',
          borderLeft: '1px solid #ccc',
          background: '#fff'
        },
        '& .MuiDataGrid-actionsCell': {
          gap: 0
        }
      }}
    />
  );
};

export default ObservationsTable;
