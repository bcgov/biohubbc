import { Typography } from '@mui/material';
import { GridCellParams, GridColDef } from '@mui/x-data-grid';
import { IAutocompleteDataGridOption } from 'components/data-grid/autocomplete/AutocompleteDataGrid.interface';
import AutocompleteDataGridEditCell from 'components/data-grid/autocomplete/AutocompleteDataGridEditCell';
import AutocompleteDataGridViewCell from 'components/data-grid/autocomplete/AutocompleteDataGridViewCell';
import { IManualTelemetryTableRow } from 'contexts/telemetryTableContext';
import { IAnimalDeploymentWithCritter } from 'interfaces/useSurveyApi.interface';
import { TelemetryDeployment } from 'interfaces/useTelemetryDeploymentApi.interface';
import { capitalize } from 'lodash-es';

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
  critterDeployments: IAnimalDeploymentWithCritter[];
  deployments: TelemetryDeployment[];
  hasError: (params: GridCellParams) => boolean;
}): GridColDef<IManualTelemetryTableRow> => {
  const optionsMap: Map<number, IAutocompleteDataGridOption<number>> = new Map();

  // Add deployments to the options map.
  props.deployments.forEach((item) => {
    optionsMap.set(item.deployment_id, {
      label: `${item.deployment_id}: ${item.critter_id}`,
      value: item.deployment_id
    });
  });

  // Add critter deployments to the options map, overriding any deployments with matching id.
  // This will ideally override all of the items from the previous forEach loop, unless we fail to find a matching
  // critter, in which case the above forEach loop will fill in that missing deployment so the column is not empty.
  if (props.critterDeployments.length) {
    props.critterDeployments.forEach((item) =>
      optionsMap.set(item.deployment.deployment_id, {
        label: `${item.deployment.deployment_id}: ${item.critter.animal_id}`,
        value: item.deployment.deployment_id
      })
    );
  }

  const options = Array.from(optionsMap.values());

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
        <AutocompleteDataGridViewCell<IManualTelemetryTableRow, number>
          dataGridProps={params}
          options={options}
          error={error}
        />
      );
    },
    renderEditCell: (params) => {
      const error = props.hasError(params);

      return (
        <AutocompleteDataGridEditCell<IManualTelemetryTableRow, number>
          dataGridProps={params}
          options={options}
          error={error}
        />
      );
    }
  };
};

export const DeviceColDef = (): GridColDef<IManualTelemetryTableRow> => {
  return {
    field: 'serial',
    headerName: 'Device',
    hideable: true,
    minWidth: 120,
    disableColumnMenu: true,
    headerAlign: 'left',
    align: 'left',
    renderCell: (params) => <Typography>{params.value}</Typography>
  };
};

//Helper functions that are used in both DevicesContainer and DevicesTable. Used here and imported to reduce duplication

export const getDeviceDeploymentsForSerial = (deployments: TelemetryDeployment[], serial: string) =>
  deployments.filter((dep) => dep.device_key?.split(':')[1] === serial);
