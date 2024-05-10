import { cyan, grey } from '@mui/material/colors';
import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';
import {
  GenericActionsColDef,
  GenericDateColDef,
  GenericLatitudeColDef,
  GenericLongitudeColDef,
  GenericTimeColDef
} from 'components/data-grid/GenericGridColumnDefinitions';
import { SkeletonTable } from 'components/loading/SkeletonLoaders';
import { SurveyContext } from 'contexts/surveyContext';
import { IManualTelemetryTableRow } from 'contexts/telemetryTableContext';
import { useTelemetryTableContext } from 'hooks/useContext';
import { useContext, useMemo } from 'react';
import { ICritterDeployment } from '../ManualTelemetryList';
import { DeploymentColDef, TelemetryTypeColDef } from './utils/GridColumnDefinitions';

interface IManualTelemetryTableProps {
  isLoading: boolean;
}

const ManualTelemetryTable = (props: IManualTelemetryTableProps) => {
  const telemetryTableContext = useTelemetryTableContext();
  const surveyContext = useContext(SurveyContext);

  surveyContext.deploymentDataLoader.load(surveyContext.projectId, surveyContext.surveyId);
  surveyContext.critterDataLoader.load(surveyContext.projectId, surveyContext.surveyId);

  const critterDeployments: ICritterDeployment[] = useMemo(() => {
    const data: ICritterDeployment[] = [];

    const critters = surveyContext.critterDataLoader.data ?? [];
    const deployments = surveyContext.deploymentDataLoader.data ?? [];

    if (!critters.length || !deployments.length) {
      return data;
    }

    const critterMap = new Map(critters.map((critter) => [critter.critter_id, critter]));

    deployments.forEach((deployment) => {
      const critter = critterMap.get(deployment.critter_id);
      if (critter) {
        data.push({ critter, deployment });
      }
    });

    return data;
  }, [surveyContext.critterDataLoader.data, surveyContext.deploymentDataLoader.data]);

  const isManualTelemetry = (row: IManualTelemetryTableRow) => row.telemetry_type === 'MANUAL';

  // Disable the delete action when record is 'Manual' telemetry
  const actionsDisabled = (params: GridRowParams<IManualTelemetryTableRow>) =>
    telemetryTableContext.isSaving || !isManualTelemetry(params.row);

  const columns: GridColDef<IManualTelemetryTableRow>[] = [
    DeploymentColDef({ critterDeployments, hasError: telemetryTableContext.hasError }),
    TelemetryTypeColDef(),
    GenericDateColDef({ field: 'date', headerName: 'Date', hasError: telemetryTableContext.hasError }),
    GenericTimeColDef({ field: 'time', headerName: 'Time', hasError: telemetryTableContext.hasError }),
    GenericLatitudeColDef({ field: 'latitude', headerName: 'Latitude', hasError: telemetryTableContext.hasError }),
    GenericLongitudeColDef({ field: 'longitude', headerName: 'Longitude', hasError: telemetryTableContext.hasError }),
    GenericActionsColDef({ disabled: actionsDisabled, onDelete: telemetryTableContext.deleteRecords })
  ];

  return (
    <DataGrid
      // Ref
      apiRef={telemetryTableContext._muiDataGridApiRef}
      // Columns
      columns={columns.map((column) => ({ ...column, flex: 1 }))}
      // Rows
      rows={telemetryTableContext.rows}
      // DataGrid Models
      rowModesModel={telemetryTableContext.rowModesModel}
      onRowModesModelChange={telemetryTableContext.onRowModesModelChange}
      rowSelectionModel={telemetryTableContext.rowSelectionModel}
      onRowSelectionModelChange={telemetryTableContext.onRowSelectionModelChange}
      columnVisibilityModel={telemetryTableContext.columnVisibilityModel}
      // Select rows
      checkboxSelection
      disableRowSelectionOnClick
      isRowSelectable={(params) => isManualTelemetry(params.row)}
      loading={props.isLoading}
      // Row edit
      editMode="row"
      isCellEditable={(params) => isManualTelemetry(params.row)}
      onRowEditStop={(_params, event) => {
        event.defaultMuiPrevented = true;
      }}
      // Styling
      rowHeight={56}
      localeText={{
        noRowsLabel: 'No Records'
      }}
      getRowHeight={() => 'auto'}
      slots={{
        loadingOverlay: SkeletonTable
      }}
      sx={{
        border: 'none',
        borderRadius: 0,
        '& .MuiDataGrid-columnHeaders': {
          position: 'relative',
          background: grey[50]
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
