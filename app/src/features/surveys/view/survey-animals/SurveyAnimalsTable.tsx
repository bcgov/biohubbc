import { Typography } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import { CustomDataGrid } from 'components/tables/CustomDataGrid';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { IDetailedCritterWithInternalId } from 'interfaces/useSurveyApi.interface';
import moment from 'moment';
import { getFormattedDate } from 'utils/Utils';
import { IAnimalDeployment } from './device';
import SurveyAnimalsTableActions from './SurveyAnimalsTableActions';

interface ISurveyAnimalsTableEntry {
  survey_critter_id: number;
  critter_id: string;
  animal_id: string | null;
  taxon: string;
  deployments?: IAnimalDeployment[];
}

interface ISurveyAnimalsTableProps {
  animalData: IDetailedCritterWithInternalId[];
  deviceData?: IAnimalDeployment[];
  onMenuOpen: (critter_id: number) => void;
  onRemoveCritter: (critter_id: number) => void;
  onAddDevice: (critter_id: number) => void;
  onEditDevice: (device_id: number) => void;
  onEditCritter: (critter_id: number) => void;
}

const noOpPlaceHolder = (critter_id: number) => {
  // This function intentionally left blank - used as placeholder.
};

export const SurveyAnimalsTable = ({
  animalData,
  deviceData,
  onMenuOpen,
  onRemoveCritter,
  onAddDevice,
  onEditDevice,
  onEditCritter
}: ISurveyAnimalsTableProps): JSX.Element => {
  const animalDeviceData: ISurveyAnimalsTableEntry[] = deviceData
    ? animalData.map((animal) => {
        const deployments = deviceData.filter((device) => device.critter_id === animal.critter_id);
        return {
          ...animal,
          deployments: deployments
        };
      })
    : animalData;

  const columns: GridColDef<ISurveyAnimalsTableEntry>[] = [
    {
      field: 'animal_id',
      headerName: 'Alias',
      flex: 1
    },
    {
      field: 'wlh_id',
      headerName: 'WLH ID',
      flex: 1,
      renderCell: (params) => <Typography>{params.value || 'None'}</Typography>
    },
    {
      field: 'taxon',
      headerName: 'Taxon',
      flex: 1
    },
    {
      field: 'create_timestamp',
      headerName: 'Created On',
      flex: 1,
      renderCell: (params) => (
        <Typography>{getFormattedDate(DATE_FORMAT.ShortDateFormatMonthFirst, params.value)}</Typography>
      )
    },
    {
      field: 'current_devices',
      headerName: 'Current Devices',
      flex: 1,
      valueGetter: (params) => {
        const currentDeploys = params.row.deployments?.filter(
          (device: IAnimalDeployment) => !device.attachment_end || moment(device.attachment_end).isAfter(moment())
        );
        return currentDeploys?.length
          ? currentDeploys.map((device: IAnimalDeployment) => device.device_id).join(', ')
          : 'No Devices';
      }
    },
    {
      field: 'previous_devices',
      headerName: 'Previous Devices',
      flex: 1,
      valueGetter: (params) => {
        const previousDeploys = params.row.deployments?.filter(
          (device: IAnimalDeployment) => device.attachment_end && moment(device.attachment_end).isBefore(moment())
        );
        return previousDeploys?.length
          ? previousDeploys.map((device: IAnimalDeployment) => device.device_id).join(', ')
          : 'No Devices';
      }
    },
    {
      field: 'actions',
      type: 'actions',
      sortable: false,
      flex: 1,
      align: 'right',
      maxWidth: 50,
      renderCell: (params) => (
        <SurveyAnimalsTableActions
          critter_id={params.row.survey_critter_id}
          devices={params.row?.deployments}
          onMenuOpen={onMenuOpen}
          onAddDevice={onAddDevice}
          onRemoveDevice={noOpPlaceHolder}
          onEditCritter={onEditCritter}
          onEditDevice={onEditDevice}
          onRemoveCritter={onRemoveCritter}
        />
      )
    }
  ];

  return (
    <CustomDataGrid
      autoHeight
      rows={animalDeviceData}
      getRowId={(row) => row.critter_id}
      columns={columns}
      pageSizeOptions={[5]}
      rowSelection={false}
      checkboxSelection={false}
      hideFooter
      disableRowSelectionOnClick
      disableColumnSelector
      disableColumnFilter
      disableColumnMenu
      disableVirtualization
      sortingOrder={['asc', 'desc']}
      data-testid="survey-animal-table"
    />
  );
};
