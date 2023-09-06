import { grey } from '@mui/material/colors';
import { makeStyles } from '@mui/styles';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { IDetailedCritterWithInternalId } from 'interfaces/useSurveyApi.interface';
import { getFormattedDate } from 'utils/Utils';
import { IAnimalDeployment } from './animal';
import SurveyAnimalsTableActions from './SurveyAnimalsTableActions';
const useStyles = makeStyles(() => ({
  projectsTable: {
    tableLayout: 'fixed'
  },
  linkButton: {
    textAlign: 'left',
    fontWeight: 700
  },
  noDataText: {
    fontFamily: 'inherit !important',
    fontSize: '0.875rem',
    fontWeight: 700
  },
  dataGrid: {
    border: 'none !important',
    fontFamily: 'inherit !important',
    '& .MuiDataGrid-columnHeaderTitle': {
      textTransform: 'uppercase',
      fontSize: '0.875rem',
      fontWeight: 700,
      color: grey[600]
    },
    '& .MuiDataGrid-cell:focus-within, & .MuiDataGrid-cellCheckbox:focus-within, & .MuiDataGrid-columnHeader:focus-within':
      {
        outline: 'none !important'
      },
    '& .MuiDataGrid-row:hover': {
      backgroundColor: 'transparent !important'
    }
  }
}));

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
  removeCritterAction: (critter_id: number) => void;
  addDeviceAction: (critter_id: number) => void;
}

const noOpPlaceHolder = (critter_id: number) => {};

export const SurveyAnimalsTable = ({
  animalData,
  deviceData,
  removeCritterAction,
  addDeviceAction
}: ISurveyAnimalsTableProps): JSX.Element => {
  const classes = useStyles();
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
      renderCell: (params) => <p>{getFormattedDate(DATE_FORMAT.ShortDateFormatMonthFirst, params.value)}</p>
    },
    {
      field: 'telemetry_device',
      headerName: 'Device ID',
      flex: 1,
      renderCell: (params) => (
        <p>{params.value?.map((device: IAnimalDeployment) => device.device_id).join(', ') ?? 'No Device'}</p>
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
          onAddDevice={addDeviceAction}
          onRemoveDevice={noOpPlaceHolder}
          onEditCritter={noOpPlaceHolder}
          onEditDevice={noOpPlaceHolder}
          onRemoveCritter={removeCritterAction}
        />
      )
    }
  ];

  const animalDeviceData = deviceData
    ? animalData.map((animal) => {
        const devices = deviceData.filter((device) => device.critter_id === animal.critter_id);
        return {
          ...animal,
          telemetry_device: devices.length ? devices : null
        };
      })
    : animalData;

  return (
    <DataGrid
      className={classes.dataGrid}
      autoHeight
      rows={animalDeviceData}
      getRowId={(row) => `survey-critter-${row.critter_id}`}
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
