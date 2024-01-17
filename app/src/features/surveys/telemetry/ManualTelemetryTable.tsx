import { mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { cyan, grey } from '@mui/material/colors';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { DataGrid, GridCellParams, GridColDef } from '@mui/x-data-grid';
import AutocompleteDataGridEditCell from 'components/data-grid/autocomplete/AutocompleteDataGridEditCell';
import AutocompleteDataGridViewCell from 'components/data-grid/autocomplete/AutocompleteDataGridViewCell';
import TextFieldDataGrid from 'components/data-grid/TextFieldDataGrid';
import TimePickerDataGrid from 'components/data-grid/TimePickerDataGrid';
import { SkeletonTable } from 'components/loading/SkeletonLoaders';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { SurveyContext } from 'contexts/surveyContext';
import { IManualTelemetryTableRow, TelemetryTableContext } from 'contexts/telemetryTableContext';
import { default as dayjs } from 'dayjs';
import { useCallback, useContext, useEffect, useMemo } from 'react';
import { getFormattedDate } from 'utils/Utils';
import { ICritterDeployment } from './ManualTelemetryList';
interface IManualTelemetryTableProps {
  isLoading: boolean;
}
const ManualTelemetryTable = (props: IManualTelemetryTableProps) => {
  const telemetryTableContext = useContext(TelemetryTableContext);
  const surveyContext = useContext(SurveyContext);

  useEffect(() => {
    surveyContext.deploymentDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
    surveyContext.critterDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
  }, []);

  const critterDeployments: ICritterDeployment[] = useMemo(() => {
    const data: ICritterDeployment[] = [];
    // combine all critter and deployments into a flat list
    surveyContext.deploymentDataLoader.data?.forEach((deployment) => {
      const critter = surveyContext.critterDataLoader.data?.find(
        (critter) => critter.critter_id === deployment.critter_id
      );
      if (critter) {
        data.push({ critter, deployment });
      }
    });
    return data;
  }, [surveyContext.critterDataLoader.data, surveyContext.deploymentDataLoader.data]);
  const { _muiDataGridApiRef } = telemetryTableContext;
  const hasError = useCallback(
    (params: GridCellParams): boolean => {
      return Boolean(
        telemetryTableContext.validationModel[params.row.id]?.some((error) => {
          return error.field === params.field;
        })
      );
    },
    [telemetryTableContext.validationModel]
  );

  const tableColumns: GridColDef<IManualTelemetryTableRow>[] = [
    {
      field: 'deployment_id',
      headerName: 'Deployment',
      editable: true,
      flex: 1,
      minWidth: 250,
      disableColumnMenu: true,
      headerAlign: 'left',
      align: 'left',
      type: 'string',
      renderCell: (params) => {
        return (
          <AutocompleteDataGridViewCell<IManualTelemetryTableRow, string>
            dataGridProps={params}
            options={critterDeployments.map((item) => ({
              label: `${item.critter.animal_id}: ${item.deployment.device_id}`,
              value: item.deployment.deployment_id
            }))}
            error={hasError(params)}
          />
        );
      },
      renderEditCell: (params) => {
        return (
          <AutocompleteDataGridEditCell<IManualTelemetryTableRow, string>
            dataGridProps={params}
            options={critterDeployments.map((item) => ({
              label: `${item.critter.animal_id}: ${item.deployment.device_id}`,
              value: item.deployment.deployment_id
            }))}
            error={hasError(params)}
          />
        );
      }
    },
    {
      field: 'latitude',
      headerName: 'Latitude',
      editable: true,
      flex: 1,
      minWidth: 120,
      disableColumnMenu: true,
      headerAlign: 'left',
      align: 'left',
      valueSetter: (params) => {
        if (/^-?\d{1,3}(?:\.\d{0,12})?$/.test(params.value)) {
          // If the value is a legal latitude value
          // Valid entries: `-1`, `-1.1`, `-123.456789` `1`, `1.1, `123.456789`
          return { ...params.row, latitude: Number(params.value) };
        }

        const value = parseFloat(params.value);
        return { ...params.row, latitude: value };
      },
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontSize: 'inherit' }}>
          {params.value}
        </Typography>
      ),
      renderEditCell: (params) => {
        const error: boolean = hasError(params);

        return (
          <TextFieldDataGrid
            dataGridProps={params}
            textFieldProps={{
              name: params.field,
              onChange: (event) => {
                if (!/^-?\d{0,3}(?:\.\d{0,12})?$/.test(event.target.value)) {
                  // If the value is not a subset of a legal latitude value, prevent the value from being applied
                  return;
                }

                _muiDataGridApiRef?.current.setEditCellValue({
                  id: params.id,
                  field: params.field,
                  value: event.target.value
                });
              },
              error
            }}
          />
        );
      }
    },
    {
      field: 'longitude',
      headerName: 'Longitude',
      editable: true,
      flex: 1,
      minWidth: 120,
      disableColumnMenu: true,
      headerAlign: 'left',
      align: 'left',
      valueSetter: (params) => {
        if (/^-?\d{1,3}(?:\.\d{0,12})?$/.test(params.value)) {
          // If the value is a legal longitude value
          // Valid entries: `-1`, `-1.1`, `-123.456789` `1`, `1.1, `123.456789`
          return { ...params.row, longitude: Number(params.value) };
        }

        const value = parseFloat(params.value);
        return { ...params.row, longitude: value };
      },
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontSize: 'inherit' }}>
          {params.value}
        </Typography>
      ),
      renderEditCell: (params) => {
        const error: boolean = hasError(params);

        return (
          <TextFieldDataGrid
            dataGridProps={params}
            textFieldProps={{
              name: params.field,
              onChange: (event) => {
                if (!/^-?\d{0,3}(?:\.\d{0,12})?$/.test(event.target.value)) {
                  // If the value is not a subset of a legal longitude value, prevent the value from being applied
                  return;
                }

                _muiDataGridApiRef?.current.setEditCellValue({
                  id: params.id,
                  field: params.field,
                  value: event.target.value
                });
              },
              error
            }}
          />
        );
      }
    },
    {
      field: 'date',
      headerName: 'Date',
      editable: true,
      flex: 1,
      minWidth: 150,
      type: 'date',
      disableColumnMenu: true,
      headerAlign: 'left',
      align: 'left',
      valueGetter: (params) => (params.row.date ? dayjs(params.row.date).toDate() : null),
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontSize: 'inherit' }}>
          {getFormattedDate(DATE_FORMAT.ShortDateFormatMonthFirst, params.value)}
        </Typography>
      ),
      renderEditCell: (params) => {
        const error = hasError(params);

        return (
          <TextFieldDataGrid
            dataGridProps={params}
            textFieldProps={{
              name: params.field,
              type: 'date',
              value: params.value ? dayjs(params.value).format('YYYY-MM-DD') : null,
              onChange: (event) => {
                const value = dayjs(event.target.value).toDate();
                _muiDataGridApiRef?.current.setEditCellValue({
                  id: params.id,
                  field: params.field,
                  value
                });
              },

              error
            }}
          />
        );
      }
    },
    {
      field: 'time',
      headerName: 'Time',
      editable: true,
      flex: 1,
      minWidth: 150,
      type: 'string',
      disableColumnMenu: true,
      headerAlign: 'left',
      align: 'left',
      valueSetter: (params) => {
        return { ...params.row, time: params.value };
      },
      valueParser: (value) => {
        if (!value) {
          return null;
        }

        if (dayjs.isDayjs(value)) {
          return value.format('HH:mm:ss');
        }

        return dayjs(value, 'HH:mm:ss').format('HH:mm:ss');
      },
      renderCell: (params) => {
        if (!params.value) {
          return null;
        }

        return (
          <Typography variant="body2" sx={{ fontSize: 'inherit' }}>
            {params.value}
          </Typography>
        );
      },
      renderEditCell: (params) => {
        const error = hasError(params);

        return (
          <TimePickerDataGrid
            dataGridProps={params}
            dateFieldProps={{
              slotProps: {
                textField: {
                  error,
                  name: params.field
                }
              }
            }}
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
      headerClassName: 'pinnedColumn',
      cellClassName: 'pinnedColumn',
      getActions: (params) => [
        <IconButton
          onClick={() => telemetryTableContext.deleteRecords([params.row])}
          disabled={telemetryTableContext.isSaving}
          key={`actions[${params.id}].handleDeleteRow`}>
          <Icon path={mdiTrashCanOutline} size={1} />
        </IconButton>
      ]
    }
  ];

  return (
    <DataGrid
      checkboxSelection
      disableRowSelectionOnClick
      loading={props.isLoading}
      rowHeight={56}
      apiRef={_muiDataGridApiRef}
      editMode="row"
      columns={tableColumns}
      rows={telemetryTableContext.rows}
      onRowEditStart={(params) => telemetryTableContext.onRowEditStart(params.id)}
      onRowEditStop={(_params, event) => {
        event.defaultMuiPrevented = true;
      }}
      localeText={{
        noRowsLabel: 'No Records'
      }}
      onRowSelectionModelChange={telemetryTableContext.onRowSelectionModelChange}
      rowSelectionModel={telemetryTableContext.rowSelectionModel}
      getRowHeight={() => 'auto'}
      slots={{
        loadingOverlay: SkeletonTable
      }}
      sx={{
        border: 'none',
        borderRadius: 0,
        '& .MuiDataGrid-columnHeaders': {
          position: 'relative'
        },
        '& .MuiDataGrid-columnHeader:focus-within': {
          outline: 'none',
          background: grey[200]
        },
        '& .MuiDataGrid-columnHeaderTitle': {
          fontWeight: 700,
          textTransform: 'uppercase',
          color: 'text.secondary'
        },
        '& .MuiDataGrid-cell': {
          py: 0.75,
          background: '#fff',
          '&.MuiDataGrid-cell--editing:focus-within': {
            outline: 'none'
          },
          '&.MuiDataGrid-cell--editing': {
            p: 0.5,
            backgroundColor: cyan[100]
          }
        },
        '& .MuiDataGrid-row--editing': {
          boxShadow: 'none',
          backgroundColor: cyan[50],
          '& .MuiDataGrid-cell': {
            backgroundColor: cyan[50]
          },
          '&.error': {
            '& .MuiDataGrid-cell, .MuiDataGrid-cell--editing': {
              backgroundColor: 'rgb(251, 237, 238)'
            }
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
        },
        '& .MuiOutlinedInput-notchedOutline': {
          border: '1px solid ' + grey[300],
          '&.Mui-focused': {
            borderColor: 'primary.main'
          }
        },
        '& .MuiDataGrid-virtualScrollerContent, .MuiDataGrid-overlay': {
          background: grey[100]
        }
      }}
    />
  );
};

export default ManualTelemetryTable;
