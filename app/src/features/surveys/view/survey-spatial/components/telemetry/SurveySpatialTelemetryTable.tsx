import { mdiArrowTopRight } from '@mdi/js';
import Typography from '@mui/material/Typography';
import { GridColDef } from '@mui/x-data-grid';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import { SkeletonTable } from 'components/loading/SkeletonLoaders';
import { NoDataOverlay } from 'components/overlay/NoDataOverlay';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { SurveyContext } from 'contexts/surveyContext';
import dayjs from 'dayjs';
import { ScientificNameTypography } from 'features/surveys/animals/components/ScientificNameTypography';
import { useContext, useMemo } from 'react';

// Set height so the skeleton loader will match table rows
const rowHeight = 52;

interface ITelemetryData {
  id: number;
  critter_id: number | null;
  device_id: number;
  frequency: number | null;
  frequency_unit: string | null;
  // start: string;
  end: string;
  itis_scientific_name: string;
}

interface ISurveyDataTelemetryTableProps {
  isLoading: boolean;
}

/**
 * Component to display telemetry data in a table format.
 *
 * @param {ISurveyDataTelemetryTableProps} props - The component props.
 * @param {boolean} props.isLoading - Indicates if the data is currently loading.
 * @returns {JSX.Element} The rendered component.
 */
export const SurveySpatialTelemetryTable = (props: ISurveyDataTelemetryTableProps) => {
  const surveyContext = useContext(SurveyContext);

  /**
   * Memoized calculation of table rows based on critter deployments data.
   * Formats dates and combines necessary fields for display.
   */
  const rows: ITelemetryData[] = useMemo(() => {
    return surveyContext.critterDeployments.map((item) => {
      return {
        // Critters in this table may use multiple devices across multiple timespans
        id: item.deployment.deployment_id,
        critter_id: item.critter.critter_id,
        animal_id: item.critter.animal_id,
        device_id: item.deployment.device_id,
        // start: dayjs(item.deployment.attachment_start).format(DATE_FORMAT.MediumDateFormat),
        end: item.deployment.attachment_end_date
          ? dayjs(item.deployment.attachment_end_date).format(DATE_FORMAT.MediumDateFormat)
          : '',
        frequency: item.deployment.frequency ?? null,
        frequency_unit: item.deployment.frequency_unit ?? null,
        itis_scientific_name: item.critter.itis_scientific_name
      };
    });
  }, [surveyContext.critterDeployments]);

  // Define table columns
  const columns: GridColDef<ITelemetryData>[] = [
    {
      field: 'animal_id',
      headerName: 'Nickname',
      flex: 1
    },
    {
      field: 'itis_scientific_name',
      headerName: 'Species',
      flex: 1,
      renderCell: (param) => {
        return (
          <ScientificNameTypography
            name={param.row.itis_scientific_name}
            textOverflow="ellipsis"
            noWrap
            overflow="hidden"
          />
        );
      }
    },
    {
      field: 'device_id',
      headerName: 'Device ID',
      flex: 1
    },
    {
      field: 'frequency',
      headerName: 'Frequency',
      flex: 1,
      renderCell: (param) => {
        return (
          <Typography>
            {param.row.frequency}&nbsp;
            <Typography component="span" color="textSecondary">
              {param.row.frequency_unit}
            </Typography>
          </Typography>
        );
      }
    },
    {
      field: 'start',
      headerName: 'Start Date',
      flex: 1
    },
    {
      field: 'end',
      headerName: 'End Date',
      flex: 1
    }
  ];

  return (
    <LoadingGuard
      isLoading={props.isLoading}
      isLoadingFallback={<SkeletonTable />}
      isLoadingFallbackDelay={100}
      hasNoData={!rows.length}
      hasNoDataFallback={
        <NoDataOverlay
          height="250px"
          title="Add Telemetry"
          subtitle="Add telemetry devices to animals and upload device data"
          icon={mdiArrowTopRight}
        />
      }
      hasNoDataFallbackDelay={100}>
      <StyledDataGrid
        noRowsMessage={'No telemetry records found'}
        columnHeaderHeight={rowHeight}
        rowHeight={rowHeight}
        rows={rows}
        getRowId={(row) => row.id}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 1, pageSize: 5 }
          }
        }}
        pageSizeOptions={[5]}
        rowSelection={false}
        checkboxSelection={false}
        disableRowSelectionOnClick
        disableColumnSelector
        disableColumnFilter
        disableColumnMenu
        disableVirtualization
        sortingOrder={['asc', 'desc']}
        data-testid="survey-spatial-telemetry-data-table"
      />
    </LoadingGuard>
  );
};
