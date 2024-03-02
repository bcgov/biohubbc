import { GridColDef } from '@mui/x-data-grid';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { ProjectRoleGuard } from 'components/security/Guards';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from 'constants/roles';
import { default as dayjs } from 'dayjs';
import { IDetailedCritterWithInternalId } from 'interfaces/useSurveyApi.interface';
import SurveyAnimalsTableActions from './SurveyAnimalsTableActions';
import { IAnimalDeployment } from './telemetry-device/device';

interface ISurveyAnimalsTableEntry {
  survey_critter_id: number;
  critter_id: string;
  animal_id: string | null;
  itis_scientific_name: string;
  deployments?: IAnimalDeployment[];
}

interface ISurveyAnimalsTableProps {
  animalData: IDetailedCritterWithInternalId[];
  deviceData?: IAnimalDeployment[];
  onMenuOpen: (critter_id: number) => void;
  onRemoveCritter: (critter_id: number) => void;
  onEditCritter: (critter_id: number) => void;
  onMapOpen: () => void;
}

export const SurveyAnimalsTable = ({
  animalData,
  deviceData,
  onMenuOpen,
  onRemoveCritter,
  onEditCritter,
  onMapOpen
}: ISurveyAnimalsTableProps): JSX.Element => {
  const animalDeviceData: ISurveyAnimalsTableEntry[] = deviceData
    ? [...animalData] // spreading this prevents this error "TypeError: Cannot assign to read only property '0' of object '[object Array]' in typescript"
        .sort() // TODO NICK ((a, b) => new Date(a.create_timestamp).getTime() - new Date(b.create_timestamp).getTime()) //This sort needed to avoid arbitrary reordering of the table when it refreshes after adding or editing
        .map((animal) => {
          const deployments = deviceData.filter((device) => device.critter_id === animal.critter_id);
          return {
            ...animal,
            deployments: deployments
          };
        })
    : animalData;

  const columns: GridColDef<ISurveyAnimalsTableEntry>[] = [
    {
      field: 'itis_scientific_name',
      headerName: 'Species',
      flex: 1
    },
    {
      field: 'animal_id',
      headerName: 'Alias',
      flex: 1
    },
    {
      field: 'wlh_id',
      headerName: 'WLH ID',
      flex: 1,
      renderCell: (params) => <>{params.value ? params.value : 'None'}</>
    },
    {
      field: 'current_devices',
      headerName: 'Current Devices',
      flex: 1,
      valueGetter: (params) => {
        const currentDeploys = params.row.deployments?.filter(
          (device: IAnimalDeployment) => !device.attachment_end || dayjs(device.attachment_end).isAfter(dayjs())
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
          (device: IAnimalDeployment) => device.attachment_end && dayjs(device.attachment_end).isBefore(dayjs())
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
        <ProjectRoleGuard
          validProjectPermissions={[PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR]}
          validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
          <SurveyAnimalsTableActions
            critter_id={params.row.survey_critter_id}
            devices={params.row?.deployments}
            onMenuOpen={onMenuOpen}
            onEditCritter={onEditCritter}
            onRemoveCritter={onRemoveCritter}
            onMapOpen={onMapOpen}
          />
        </ProjectRoleGuard>
      )
    }
  ];

  return (
    <StyledDataGrid
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
