import { cyan, grey } from '@mui/material/colors';
import { DataGrid, GridColDef, useGridApiRef } from '@mui/x-data-grid';
import { GridTableRowSkeleton } from 'components/loading/SkeletonLoaders';
import { IManualTelemetryTableRow } from 'contexts/telemetryTableContext';
import { v4 as uuidv4 } from 'uuid';

const ManualTelemetryTable = () => {
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
        return { ...params.row };
      },
      renderCell: (params) => {
        return <></>;
      },
      renderEditCell: (params) => {
        return <></>;
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
        return { ...params.row };
      },
      renderCell: (params) => {
        return <></>;
      },
      renderEditCell: (params) => {
        return <></>;
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
        return { ...params.row };
      },
      renderCell: (params) => {
        return <></>;
      },
      renderEditCell: (params) => {
        return <></>;
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
        return { ...params.row };
      },
      renderCell: (params) => {
        return <></>;
      },
      renderEditCell: (params) => {
        return <></>;
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
      valueSetter: (params) => {
        return { ...params.row };
      },
      renderCell: (params) => {
        return <></>;
      },
      renderEditCell: (params) => {
        return <></>;
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
        return { ...params.row };
      },
      renderCell: (params) => {
        return <></>;
      },
      renderEditCell: (params) => {
        return <></>;
      }
    }
  ];

  return (
    <DataGrid
      checkboxSelection
      disableRowSelectionOnClick
      loading={false}
      rowHeight={56}
      apiRef={useGridApiRef()}
      editMode="row"
      columns={tableColumns}
      rows={[
        {
          id: uuidv4(),
          alias: 'Moose',
          device_id: 1,
          latitude: 1,
          longitude: 1,
          date: '',
          time: ''
        },
        {
          id: uuidv4(),
          alias: 'Mouse',
          device_id: 123,
          latitude: 1,
          longitude: 1,
          date: '',
          time: ''
        },
        {
          id: uuidv4(),
          alias: '',
          device_id: 13322,
          latitude: 1,
          longitude: 1,
          date: '',
          time: ''
        },
        {
          id: uuidv4(),
          alias: '',
          device_id: 12211,
          latitude: 1,
          longitude: 1,
          date: '',
          time: ''
        }
      ]}
      onRowEditStart={(params) => {}}
      onRowEditStop={(_params, event) => {
        event.defaultMuiPrevented = true;
      }}
      localeText={{
        noRowsLabel: 'No Records'
      }}
      onRowSelectionModelChange={() => {}}
      rowSelectionModel={undefined}
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
