import { Typography } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import { CustomDataGrid } from 'components/tables/CustomDataGrid';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { IDetailedCritterWithInternalId } from 'interfaces/useSurveyApi.interface';
import { getFormattedDate } from 'utils/Utils';
import { IAnimalDeployment } from './animal';
import SurveyAnimalsTableActions from './SurveyAnimalsTableActions';

interface ISurveyAnimalsTableEntry {
  survey_critter_id: number;
  critter_id: string;
  animal_id: string | null;
  taxon: string;
  telemetry_device?: IAnimalDeployment[];
}

interface ISurveyAnimalsTableProps {
  animalData: IDetailedCritterWithInternalId[];
  deviceData?: IAnimalDeployment[];
  onMenuOpen: (critter_id: number) => void;
  onRemoveCritter: (critter_id: number) => void;
  onAddDevice: (critter_id: number) => void;
  onEditDevice: (device_id: number) => void;
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
  onEditDevice
}: ISurveyAnimalsTableProps): JSX.Element => {
  const animalDeviceData: ISurveyAnimalsTableEntry[] = deviceData
    ? animalData.map((animal) => {
        const deployments = deviceData.filter((device) => device.critter_id === animal.critter_id);
        return {
          ...animal,
          telemetry_device: deployments
        };
      })
    : animalData;

  const columns: GridColDef<ISurveyAnimalsTableEntry>[] = [
    {
      field: 'critter_id',
      headerName: 'Critter ID',
      flex: 1,
      minWidth: 300
    },
    {
      field: 'animal_id',
      headerName: 'Animal ID',
      flex: 1
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
      field: 'telemetry_device',
      headerName: 'Device ID',
      flex: 1,
      renderCell: (params) => (
        <Typography>
          {params.value?.length
            ? params.value?.map((device: IAnimalDeployment) => device.device_id).join(', ')
            : 'No Device'}
        </Typography>
      )
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
          devices={params.row?.telemetry_device}
          disabledFields={{
            editDevice: !params.row.telemetry_device?.length,
            removeDevice: !params.row.telemetry_device?.length
          }}
          onMenuOpen={onMenuOpen}
          onAddDevice={onAddDevice}
          onRemoveDevice={noOpPlaceHolder}
          onEditCritter={noOpPlaceHolder}
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
      sortingOrder={['asc', 'desc']}
      data-testid="survey-animal-table"
    />
  );
};
