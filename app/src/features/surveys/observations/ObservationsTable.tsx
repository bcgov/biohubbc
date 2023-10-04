import { mdiDotsVertical, mdiTrashCan } from '@mdi/js';
import Icon from '@mdi/react';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import { DataGrid, GridColDef, GridEventListener, GridRowModelUpdate } from '@mui/x-data-grid';
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import AutocompleteDataGridEditCell from 'components/data-grid/autocomplete/AutocompleteDataGridEditCell';
import AutocompleteDataGridViewCell from 'components/data-grid/autocomplete/AutocompleteDataGridViewCell';
import ConditionalAutocompleteDataGridEditCell from 'components/data-grid/conditional-autocomplete/ConditionalAutocompleteDataGridEditCell';
import ConditionalAutocompleteDataGridViewCell from 'components/data-grid/conditional-autocomplete/ConditionalAutocompleteDataGridViewCell';
import TaxonomyDataGridEditCell from 'components/data-grid/taxonomy/TaxonomyDataGridEditCell';
import TaxonomyDataGridViewCell from 'components/data-grid/taxonomy/TaxonomyDataGridViewCell';
import { IObservationTableRow, ObservationsContext } from 'contexts/observationsContext';
import moment from 'moment';
import { useContext, useEffect } from 'react';

export interface ISampleSiteSelectProps {
  survey_sample_site_id: number;
  sample_site_name: string;
}

export interface ISampleMethodSelectProps {
  survey_sample_method_id: number;
  survey_sample_site_id: number;
  sample_method_name: string;
}

export interface ISamplePeriodSelectProps {
  survey_sample_period_id: number;
  survey_sample_method_id: number;
  sample_period_name: string;
}
export interface ISpeciesObservationTableProps {
  sample_sites: {
    survey_sample_site_id: number;
    sample_site_name: string;
  }[];
  sample_methods: {
    survey_sample_method_id: number;
    survey_sample_site_id: number;
    sample_method_name: string;
  }[];
  sample_periods: {
    survey_sample_period_id: number;
    survey_sample_method_id: number;
    sample_period_name: string;
  }[];
}

const ObservationsTable = (props: ISpeciesObservationTableProps) => {
  const { sample_sites, sample_methods, sample_periods } = props;
  const observationsContext = useContext(ObservationsContext);
  const { observationsDataLoader } = observationsContext;

  const apiRef = observationsContext._muiDataGridApiRef;

  const observationColumns: GridColDef<IObservationTableRow>[] = [
    {
      field: 'wldtaxonomic_units_id',
      headerName: 'Species',
      editable: true,
      flex: 1,
      minWidth: 250,
      disableColumnMenu: true,
      headerAlign: 'left',
      align: 'left',
      renderCell: (params) => {
        return <TaxonomyDataGridViewCell dataGridProps={params} />;
      },
      renderEditCell: (params) => {
        return <TaxonomyDataGridEditCell dataGridProps={params} />;
      }
    },
    {
      field: 'survey_sample_site_id',
      headerName: 'Sampling Site',
      editable: true,
      flex: 1,
      minWidth: 200,
      disableColumnMenu: true,
      headerAlign: 'left',
      align: 'left',
      preProcessEditCellProps: (params) => {
        return { ...params.props };
      },
      renderCell: (params) => {
        return (
          <AutocompleteDataGridViewCell
            dataGridProps={params}
            options={sample_sites.map((item) => ({
              label: item.sample_site_name,
              value: item.survey_sample_site_id
            }))}
          />
        );
      },
      renderEditCell: (params) => {
        return (
          <AutocompleteDataGridEditCell
            dataGridProps={params}
            options={sample_sites.map((item) => ({
              label: item.sample_site_name,
              value: item.survey_sample_site_id
            }))}
          />
        );
      }
    },
    {
      field: 'survey_sample_method_id',
      headerName: 'Sampling Method',
      editable: true,
      flex: 1,
      minWidth: 200,
      disableColumnMenu: true,
      headerAlign: 'left',
      align: 'left',
      preProcessEditCellProps: (params) => {
        return { ...params.props };
      },
      renderCell: (params) => {
        return (
          <ConditionalAutocompleteDataGridViewCell
            dataGridProps={params}
            optionsGetter={(row, allOptions) => {
              return allOptions
                .filter((item) => item.survey_sample_site_id === row.survey_sample_site_id)
                .map((item) => ({ label: item.sample_method_name, value: item.survey_sample_method_id }));
            }}
            allOptions={sample_methods}
          />
        );
      },
      renderEditCell: (params) => {
        return (
          <ConditionalAutocompleteDataGridEditCell
            dataGridProps={params}
            optionsGetter={(row, allOptions) => {
              return allOptions
                .filter((item) => item.survey_sample_site_id === row.survey_sample_site_id)
                .map((item) => ({ label: item.sample_method_name, value: item.survey_sample_method_id }));
            }}
            allOptions={sample_methods}
          />
        );
      }
    },
    {
      field: 'survey_sample_period_id',
      headerName: 'Sampling Period',
      editable: true,
      flex: 1,
      minWidth: 200,
      disableColumnMenu: true,
      headerAlign: 'left',
      align: 'left',
      preProcessEditCellProps: (params) => {
        return { ...params.props };
      },
      renderCell: (params) => {
        return (
          <ConditionalAutocompleteDataGridViewCell
            dataGridProps={params}
            optionsGetter={(row, allOptions) => {
              return allOptions
                .filter((item) => item.survey_sample_method_id === row.survey_sample_method_id)
                .map((item) => ({ label: item.sample_period_name, value: item.survey_sample_period_id }));
            }}
            allOptions={sample_periods}
          />
        );
      },
      renderEditCell: (params) => {
        return (
          <ConditionalAutocompleteDataGridEditCell
            dataGridProps={params}
            optionsGetter={(row, allOptions) => {
              return allOptions
                .filter((item) => item.survey_sample_method_id === row.survey_sample_method_id)
                .map((item) => ({ label: item.sample_period_name, value: item.survey_sample_period_id }));
            }}
            allOptions={sample_periods}
          />
        );
      }
    },
    {
      field: 'count',
      headerName: 'Count',
      editable: true,
      type: 'number',
      minWidth: 100,
      disableColumnMenu: true,
      headerAlign: 'left',
      align: 'left'
    },
    {
      field: 'observation_date',
      headerName: 'Date',
      editable: true,
      type: 'date',
      minWidth: 150,
      valueGetter: (params) => (params.row.observation_date ? moment(params.row.observation_date).toDate() : null),
      disableColumnMenu: true,
      headerAlign: 'left',
      align: 'left'
    },
    {
      field: 'observation_time',
      headerName: 'Time',
      editable: true,
      type: 'string',
      width: 150,
      disableColumnMenu: true,
      headerAlign: 'left',
      align: 'left',
      preProcessEditCellProps: (params) => {
        return { ...params.props, value: moment(params.props.value) };
      },
      renderCell: (params) => {
        if (!params.value) {
          return null;
        }

        if (moment.isMoment(params.value)) {
          return <>{params.value.format('HH:mm')}</>;
        }

        return <>{moment(params.value, 'HH:mm:ss').format('HH:mm')}</>;
      },
      renderEditCell: (params) => {
        return (
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <TimePicker
              value={moment(params.value, 'HH:mm:ss')}
              onChange={(value) => {
                apiRef?.current.setEditCellValue({ id: params.id, field: params.field, value: value });
              }}
              onAccept={(value) => {
                apiRef?.current.setEditCellValue({ id: params.id, field: params.field, value: value });
              }}
              ampm={false}
            />
          </LocalizationProvider>
        );
      }
    },
    {
      field: 'latitude',
      headerName: 'Lat',
      type: 'number',
      editable: true,
      width: 150,
      disableColumnMenu: true,
      headerAlign: 'left',
      align: 'left'
    },
    {
      field: 'longitude',
      headerName: 'Long',
      type: 'number',
      editable: true,
      width: 150,
      disableColumnMenu: true,
      headerAlign: 'left',
      align: 'left'
    },
    {
      field: 'actions',
      headerName: '',
      type: 'actions',
      width: 96,
      disableColumnMenu: true,
      resizable: false,
      getActions: (params) => [
        <IconButton onClick={() => handleDeleteRow(params.id)} key={`actions[${params.id}].handleDeleteRow`}>
          <Icon path={mdiTrashCan} size={1} />
        </IconButton>,
        <IconButton key={`actions[${params.id}].moreOptions`}>
          <Icon path={mdiDotsVertical} size={1} />
        </IconButton>
      ]
    }
  ];

  useEffect(() => {
    if (observationsDataLoader.data?.surveyObservations) {
      const rows: IObservationTableRow[] = observationsDataLoader.data.surveyObservations.map(
        (row: IObservationTableRow) => ({
          ...row,
          id: String(row.survey_observation_id)
        })
      );

      observationsContext.setInitialRows(rows);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [observationsDataLoader.data]);

  const handleDeleteRow = (id: string | number) => {
    observationsContext.markRecordWithUnsavedChanges(id);
    apiRef?.current.updateRows([{ id, _action: 'delete' } as GridRowModelUpdate]);
  };

  const handleRowEditStart: GridEventListener<'rowEditStart'> = (params, event) => {
    observationsContext.markRecordWithUnsavedChanges(params.row.id);
  };

  const handleRowEditStop: GridEventListener<'rowEditStop'> = (_params, event) => {
    event.defaultMuiPrevented = true;
  };

  const handleCellClick: GridEventListener<'cellClick'> = (params, event) => {
    if (apiRef?.current.state.editRows[params.row.id]) {
      return;
    }

    apiRef?.current.startRowEditMode({ id: params.row.id, fieldToFocus: params.field });
  };

  const handleProcessRowUpdate = (newRow: IObservationTableRow) => {
    const updatedRow = { ...newRow, wldtaxonomic_units_id: Number(newRow.wldtaxonomic_units_id) };
    return updatedRow;
  };

  if (!apiRef) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <DataGrid
      apiRef={apiRef}
      editMode="row"
      onCellClick={handleCellClick}
      onRowEditStop={handleRowEditStop}
      onRowEditStart={handleRowEditStart}
      processRowUpdate={handleProcessRowUpdate}
      columns={observationColumns}
      rows={observationsContext.initialRows}
      disableRowSelectionOnClick
      localeText={{
        noRowsLabel: 'No Records'
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
        '& .MuiDataGrid-actionsCell': {
          gap: 0
        }
      }}
    />
  );
};

export default ObservationsTable;
