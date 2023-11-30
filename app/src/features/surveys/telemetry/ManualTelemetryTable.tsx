import { mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { cyan, grey } from '@mui/material/colors';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { DataGrid, GridCellParams, GridColDef } from '@mui/x-data-grid';
import TextFieldDataGrid from 'components/data-grid/TextFieldDataGrid';
import TimePickerDataGrid from 'components/data-grid/TimePickerDataGrid';
import { GridTableRowSkeleton } from 'components/loading/SkeletonLoaders';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { IManualTelemetryTableRow, TelemetryTableContext } from 'contexts/telemetryTableContext';
import moment from 'moment';
import { useCallback, useContext } from 'react';
import { getFormattedDate } from 'utils/Utils';
interface IManualTelemetryTableProps {
  isLoading: boolean;
}
const ManualTelemetryTable = (props: IManualTelemetryTableProps) => {
  const telemetryTableContext = useContext(TelemetryTableContext);
  const { _muiDataGridApiRef } = telemetryTableContext;
  const hasError = useCallback(
    (params: GridCellParams): boolean => {
      return Boolean(
        telemetryTableContext.validationModel[params.row.id]?.some((error: any) => {
          return error.field === params.field;
        })
      );
    },
    [telemetryTableContext.validationModel]
  );

  const tableColumns: GridColDef<IManualTelemetryTableRow>[] = [
    {
      field: 'alias',
      headerName: 'Alias',
      editable: true,
      flex: 1,
      minWidth: 250,
      type: 'string',
      disableColumnMenu: true,
      headerAlign: 'left',
      align: 'left',
      valueSetter: (params) => {
        return { ...params.row, alias: String(params.value) };
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
      field: 'device_id',
      headerName: 'Device ID',
      editable: true,
      flex: 1,
      minWidth: 250,
      type: 'number',
      disableColumnMenu: true,
      headerAlign: 'left',
      align: 'left',
      valueSetter: (params) => {
        return { ...params.row, device_id: Number(params.value) };
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
                if (!/^\d{0,7}$/.test(event.target.value)) {
                  // If the value is not a number, return
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
      valueGetter: (params) => (params.row.date ? moment(params.row.date).toDate() : null),
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
              value: params.value ? moment(params.value).format('YYYY-MM-DD') : null,
              onChange: (event) => {
                const value = moment(event.target.value).toDate();
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

        if (moment.isMoment(value)) {
          return value.format('HH:mm:ss');
        }

        return moment(value, 'HH:mm:ss').format('HH:mm:ss');
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
        loadingOverlay: GridTableRowSkeleton
      }}
      sx={{
        background: grey[50],
        border: 'none',
        '& .pinnedColumn': {
          position: 'sticky',
          right: 0,
          top: 0,
          borderLeft: '1px solid' + grey[300]
        },
        '& .MuiDataGrid-columnHeaders': {
          background: '#fff',
          position: 'relative',
          '&:after': {
            content: "''",
            position: 'absolute',
            top: '0',
            right: 0,
            width: '70px',
            height: '60px',
            background: '#fff',
            borderLeft: '1px solid' + grey[300]
          }
        },
        '& .MuiDataGrid-columnHeader': {
          // px: 3,
          py: 1,
          '&:focus': {
            outline: 'none'
          }
        },
        '& .MuiDataGrid-columnHeaderTitle': {
          fontWeight: 700,
          textTransform: 'uppercase',
          color: 'text.secondary'
        },
        '& .MuiDataGrid-cell': {
          // px: 3,
          py: 1,
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
        '& .MuiDataGrid-virtualScrollerContent': {
          background: grey[100]
        },
        '& .MuiDataGrid-footerContainer': {
          background: '#fff'
        }
      }}
    />
  );
};

export default ManualTelemetryTable;
