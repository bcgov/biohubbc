import { Typography } from '@mui/material';
import { GridCellParams, GridColDef } from '@mui/x-data-grid';
import AutocompleteDataGridEditCell from 'components/data-grid/autocomplete/AutocompleteDataGridEditCell';
import AutocompleteDataGridViewCell from 'components/data-grid/autocomplete/AutocompleteDataGridViewCell';
import { IManualTelemetryTableRow } from 'contexts/telemetryTableContext';
import { capitalize } from 'lodash-es';
import { ICritterDeployment } from '../../list/TelemetryList';

export const TelemetryTypeColDef = (): GridColDef<IManualTelemetryTableRow> => {
  return {
    field: 'telemetry_type',
    headerName: 'Vendor',
    editable: false,
    hideable: true,
    minWidth: 120,
    disableColumnMenu: true,
    headerAlign: 'left',
    align: 'left',
    type: 'string',
    valueGetter: (params) => capitalize(params.value)
  };
};

export const DeploymentColDef = (props: {
  critterDeployments: ICritterDeployment[];
  hasError: (params: GridCellParams) => boolean;
}): GridColDef<IManualTelemetryTableRow> => {
  return {
    field: 'deployment_id',
    headerName: 'Deployment',
    editable: true,
    hideable: true,
    minWidth: 120,
    disableColumnMenu: true,
    headerAlign: 'left',
    align: 'left',
    type: 'string',
    renderCell: (params) => {
      const error = props.hasError(params);
      return (
        <AutocompleteDataGridViewCell<IManualTelemetryTableRow, string>
          dataGridProps={params}
          options={props.critterDeployments.map((item) => {
            return {
              label: `${item.critter.animal_id}: ${item.deployment.device_id}`,
              value: item.deployment.deployment_id
            };
          })}
          error={error}
        />
      );
    },
    renderEditCell: (params) => {
      const error = props.hasError(params);

      return (
        <AutocompleteDataGridEditCell<IManualTelemetryTableRow, string>
          dataGridProps={params}
          options={props.critterDeployments.map((item) => ({
            label: `${item.critter.animal_id}: ${item.deployment.device_id}`,
            value: item.deployment.deployment_id
          }))}
          error={error}
        />
      );
    }
  };
};

export const DeviceColDef = (props: {
  critterDeployments: ICritterDeployment[];
}): GridColDef<IManualTelemetryTableRow> => {
  return {
    field: 'device_id',
    headerName: 'Device',
    hideable: true,
    minWidth: 120,
    disableColumnMenu: true,
    headerAlign: 'left',
    align: 'left',
    renderCell: (params) => (
      <Typography>
        {
          props.critterDeployments.find(
            (deployment) => deployment.deployment.deployment_id === params.row.deployment_id
          )?.deployment.device_id
        }
      </Typography>
    )
  };
};
