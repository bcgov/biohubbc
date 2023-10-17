import { mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import { cyan, grey } from '@mui/material/colors';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import TextField from '@mui/material/TextField';
import {
  DataGrid,
  GridColDef,
  GridEventListener,
  GridInputRowSelectionModel,
  GridRowModelUpdate
} from '@mui/x-data-grid';
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import AutocompleteDataGridEditCell from 'components/data-grid/autocomplete/AutocompleteDataGridEditCell';
import AutocompleteDataGridViewCell from 'components/data-grid/autocomplete/AutocompleteDataGridViewCell';
import ConditionalAutocompleteDataGridEditCell from 'components/data-grid/conditional-autocomplete/ConditionalAutocompleteDataGridEditCell';
import ConditionalAutocompleteDataGridViewCell from 'components/data-grid/conditional-autocomplete/ConditionalAutocompleteDataGridViewCell';
import TaxonomyDataGridEditCell from 'components/data-grid/taxonomy/TaxonomyDataGridEditCell';
import TaxonomyDataGridViewCell from 'components/data-grid/taxonomy/TaxonomyDataGridViewCell';
import YesNoDialog from 'components/dialog/YesNoDialog';
import { ObservationsTableI18N } from 'constants/i18n';
import { IObservationRecord, IObservationTableRow, ObservationsContext } from 'contexts/observationsContext';
import moment from 'moment';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router';

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

const SampleSiteSkeleton = () => (
  <Box
    sx={{
      display: 'flex',
      gap: '16px',
      alignItemx: 'center',
      p: 1,
      height: 58,
      background: '#fff',
      borderBottom: '1px solid ' + grey[300]
    }}>
    <Skeleton height={26} sx={{ flex: '1 1 auto' }} />
    <Skeleton height={26} sx={{ flex: '1 1 auto' }} />
    <Skeleton height={26} sx={{ flex: '1 1 auto' }} />
    <Skeleton height={26} sx={{ flex: '1 1 auto' }} />
    <Skeleton height={26} sx={{ flex: '1 1 auto' }} />
    <Skeleton height={26} sx={{ flex: '1 1 auto' }} />
  </Box>
);

const LoadingOverlay = () => {
  return (
    <Box display="flex" flexDirection="column">
      <SampleSiteSkeleton />
      <SampleSiteSkeleton />
      <SampleSiteSkeleton />
      <SampleSiteSkeleton />
    </Box>
  );
};

const ObservationsTable = (props: ISpeciesObservationTableProps) => {
  const { sample_sites, sample_methods, sample_periods } = props;
  const location = useLocation();

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
      valueSetter: (params) => {
        return { ...params.row, wldtaxonomic_units_id: Number(params.value) };
      },
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
      minWidth: 250,
      disableColumnMenu: true,
      headerAlign: 'left',
      align: 'left',
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
      minWidth: 250,
      disableColumnMenu: true,
      headerAlign: 'left',
      align: 'left',
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
      flex: 0,
      width: 240,
      disableColumnMenu: true,
      headerAlign: 'left',
      align: 'left',
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
      minWidth: 110,
      disableColumnMenu: true,
      headerAlign: 'right',
      align: 'right',
      valueSetter: (params) => {
        const value = Number(params.value);
        return { ...params.row, count: isNaN(value) ? value : undefined };
      },
      valueParser: (value) => {
        if (!value) {
          return '';
        }

        if (/^\d*$/.test(value)) {
          // Value contains only number characters
          return value;
        }

        // Value contains non-number characters, strip out non-number characters
        return value.replace(/\D/g, '');
      },
      renderEditCell: (params) => {
        const value = !params.value || isNaN(params.value) ? '' : params.value;
        return (
          <TextField
            onChange={(event) => {
              apiRef?.current.setEditCellValue({
                id: params.id,
                field: params.field,
                value: event.target.value
              });
            }}
            value={value}
            variant="outlined"
            type="text"
            inputProps={{ inputMode: 'numeric' }}
          />
        );
      }
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
      headerAlign: 'right',
      align: 'right',
      valueSetter: (params) => {
        return { ...params.row, observation_time: params.value };
      },
      valueParser: (value) => {
        if (!value) {
          return null;
        }

        if (moment.isMoment(value)) {
          return value.format('HH:mm');
        }

        return moment(value, 'HH:mm:ss').format('HH:mm');
      },
      renderCell: (params) => {
        if (!params.value) {
          return null;
        }

        return <>{params.value}</>;
      },
      renderEditCell: (params) => {
        return (
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <TimePicker
              value={(params.value && moment(params.value, 'HH:mm:ss')) || null}
              onChange={(value) => {
                apiRef?.current.setEditCellValue({ id: params.id, field: params.field, value: value });
              }}
              onAccept={(value) => {
                apiRef?.current.setEditCellValue({
                  id: params.id,
                  field: params.field,
                  value: value?.format('HH:mm:ss')
                });
              }}
              timeSteps={{ hours: 1, minutes: 1 }}
              ampm={false}
            />
          </LocalizationProvider>
        );
      }
    },
    {
      field: 'latitude',
      headerName: 'Lat',
      editable: true,
      type: 'number',
      width: 120,
      disableColumnMenu: true,
      headerAlign: 'right',
      align: 'right',
      valueSetter: (params) => {
        if (/^-?\d{0,3}(?:\.\d{1,12})?$/.test(params.value)) {
          // If the value is a legal latitude value
          // Valid entries: `-1`, `-1.1`, `-123.456789` `1`, `1.1, `123.456789`
          return { ...params.row, latitude: Number(params.value) };
        }

        return { ...params.row, latitude: parseFloat(params.value) };
      },
      renderEditCell: (params) => {
        return (
          <TextField
            onChange={(event) => {
              if (!/^-?\d{0,3}(?:\.\d{0,12})?$/.test(event.target.value)) {
                // If the value is not a subset of a legal latitude value, prevent the value from being applied
                return;
              }

              apiRef?.current.setEditCellValue({
                id: params.id,
                field: params.field,
                value: event.target.value
              });
            }}
            value={params.value || ''}
            variant="outlined"
            type="text"
            inputProps={{ inputMode: 'numeric' }}
          />
        );
      }
    },
    {
      field: 'longitude',
      headerName: 'Long',
      editable: true,
      type: 'number',
      width: 120,
      disableColumnMenu: true,
      headerAlign: 'right',
      align: 'right',
      valueSetter: (params) => {
        if (/^-?\d{1,3}(?:\.\d{1,12})?$/.test(params.value)) {
          // If the value is a legal latitude value
          // Valid entries: `-1`, `-1.1`, `-123.456789` `1`, `1.1, `123.456789`
          return { ...params.row, longitude: Number(params.value) };
        }

        return { ...params.row, longitude: parseFloat(params.value) };
      },
      renderEditCell: (params) => {
        return (
          <TextField
            onChange={(event) => {
              if (!/^-?\d{0,3}(?:\.\d{0,12})?$/.test(event.target.value)) {
                // If the value is not a subset of a legal latitude value, prevent the value from being applied
                return;
              }

              apiRef?.current.setEditCellValue({
                id: params.id,
                field: params.field,
                value: event.target.value
              });
            }}
            value={parseFloat(params.value) || ''}
            variant="outlined"
            type="text"
            inputProps={{ inputMode: 'numeric' }}
          />
        );
      }
    },
    {
      field: 'actions',
      headerName: '',
      type: 'actions',
      width: 70,
      disableColumnMenu: true,
      resizable: false,
      cellClassName: 'pinnedColumn',
      getActions: (params) => [
        <IconButton
          onClick={(event) => {
            event.preventDefault(); // Prevent row from going into edit mode
            handleConfirmDeleteRow(params.id);
          }}
          key={`actions[${params.id}].handleDeleteRow`}>
          <Icon path={mdiTrashCanOutline} size={1} />
        </IconButton>
      ]
    }
  ];

  const [deletingObservation, setDeletingObservation] = useState<string | number | null>(null);
  const showConfirmDeleteDialog = Boolean(deletingObservation);

  const rowSelectionModel: GridInputRowSelectionModel | undefined = useMemo(() => {
    if (location.hash.startsWith('#view-')) {
      const selectedId = location.hash.split('-')[1];
      return [selectedId];
    }

    return undefined;
  }, []);

  useEffect(() => {
    if (observationsDataLoader.data?.surveyObservations) {
      const rows: IObservationTableRow[] = observationsDataLoader.data.surveyObservations.map(
        (row: IObservationRecord) => ({
          ...row,
          id: String(row.survey_observation_id)
        })
      );

      observationsContext.setInitialRows(rows);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [observationsDataLoader.data]);

  const handleCancelDeleteRow = () => {
    setDeletingObservation(null);
  };

  const handleConfirmDeleteRow = (id: string | number) => {
    setDeletingObservation(id);
  };

  const handleDeleteRow = (id: string | number) => {
    observationsContext.markRecordWithUnsavedChanges(id);
    apiRef?.current.updateRows([{ id, _action: 'delete' } as GridRowModelUpdate]);
  };

  const handleRowEditStop: GridEventListener<'rowEditStop'> = (_params, event) => {
    event.defaultMuiPrevented = true;
  };

  const handleCellClick: GridEventListener<'cellClick'> = (params, event) => {
    const { id } = params.row;

    if (apiRef?.current.state.editRows[id]) {
      return;
    }

    apiRef?.current.startRowEditMode({ id, fieldToFocus: params.field });
    observationsContext.markRecordWithUnsavedChanges(id);
  };

  return (
    <>
      <YesNoDialog
        dialogTitle={ObservationsTableI18N.removeRecordDialogTitle}
        dialogText={ObservationsTableI18N.removeRecordDialogText}
        yesButtonProps={{ color: 'error' }}
        yesButtonLabel={'Delete Record'}
        noButtonProps={{ color: 'primary', variant: 'outlined' }}
        noButtonLabel={'Cancel'}
        open={showConfirmDeleteDialog}
        onYes={() => {
          if (deletingObservation) {
            handleDeleteRow(deletingObservation);
          }
          setDeletingObservation(null);
        }}
        onClose={() => handleCancelDeleteRow()}
        onNo={() => handleCancelDeleteRow()}
      />
      <DataGrid
        loading={observationsDataLoader.isLoading}
        rowHeight={56}
        apiRef={apiRef}
        editMode="row"
        onCellClick={handleCellClick}
        onRowEditStop={handleRowEditStop}
        columns={observationColumns}
        rows={observationsContext.initialRows}
        disableRowSelectionOnClick
        localeText={{
          noRowsLabel: 'No Records'
        }}
        rowSelectionModel={rowSelectionModel}
        getRowHeight={() => 'auto'}
        slots={{
          loadingOverlay: LoadingOverlay
        }}
        sx={{
          border: 'none',
          '& .MuiDataGrid-columnHeaders': {
            position: 'relative',
            '&:after': {
              content: "''",
              position: 'absolute',
              top: '20px',
              right: 0,
              width: '70px',
              height: '60px',
              background: '#fff'
            }
          },
          '& .MuiDataGrid-columnHeader': {
            px: 2,
            py: 1
          },
          '& .MuiDataGrid-columnHeader:focus': {
            outline: 'none'
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 700,
            textTransform: 'uppercase',
            color: 'text.secondary'
          },
          '& .pinnedColumn': {
            position: 'sticky',
            right: 0,
            top: 0,
            borderLeft: '1px solid #ccc'
          },
          '& .MuiDataGrid-row--editing': {
            boxShadow: 'none',
            backgroundColor: cyan[50],
            '& .MuiDataGrid-cell': {
              backgroundColor: cyan[50]
            }
          },
          '& .MuiDataGrid-cell': {
            px: 2,
            py: 1,
            background: '#fff',
            '&.MuiDataGrid-cell--editing:focus-within': {
              outline: 'none'
            },
            '&.MuiDataGrid-cell--editing': {
              px: 0.5,
              py: 1,
              backgroundColor: cyan[50]
            }
          },
          '& .MuiDataGrid-editInputCell': {
            border: '1px solid #ccc',
            '&:hover': {
              borderColor: 'primary.main'
            },
            '&.Mui-focused': {
              borderColor: 'primary.main',
              outlineWidth: '2px',
              outlineStyle: 'solid',
              outlineColor: 'primary.main',
              outlineOffset: '-2px'
            }
          },
          '& .MuiInputBase-root': {
            height: '40px',
            borderRadius: '4px',
            background: '#fff',
            fontSize: '0.875rem',
            '&.MuiDataGrid-editInputCell': {
              padding: 0
            }
          },
          '& .MuiOutlinedInput': {
            '&-notchedoutline': {
              border: '1px solid ' + grey[300]
            }
          },
          '& .MuiOutlinedInput-notchedOutline': {
            '&.Mui-focused': {
              borderColor: 'primary.main'
            }
          },
          '& .MuiOutlinedInput-root': {
            borderRadius: '4px',
            background: '#fff',
            border: 'none',
            '&:hover': {
              borderColor: 'primary.main'
            },
            '&:hover > fieldset': {
              border: '1px solid primary.main'
            }
          }
        }}
      />
    </>
  );
};

export default ObservationsTable;
