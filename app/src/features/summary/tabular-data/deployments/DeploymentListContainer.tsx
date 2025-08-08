import { mdiArrowTopRight } from '@mdi/js';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import grey from '@mui/material/colors/grey';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { GridColDef, GridPaginationModel, GridSortDirection, GridSortModel } from '@mui/x-data-grid';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import { SkeletonTable } from 'components/loading/SkeletonLoaders';
import { NoDataOverlay } from 'components/overlay/NoDataOverlay';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import dayjs from 'dayjs';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useCodesContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { useDeepCompareEffect } from 'hooks/useDeepCompareEffect';
import { useSearchParams } from 'hooks/useSearchParams';
import { TelemetryDeployment } from 'interfaces/useTelemetryDeploymentApi.interface';

import { useState } from 'react';
import { ApiPaginationRequestOptions, StringValues } from 'types/misc';
import { firstOrNull } from 'utils/Utils';
import {
  DeploymentAdvancedFiltersInitialValues,
  DeploymentListFilterForm,
  IAllDeploymentAdvancedFilters,
  IAllDeploymentAdvancedFilters as IFormDeploymentAdvancedFilters
} from './DeploymentListFilterForm';

// Supported URL parameters
// Note: Prefix 't_' is used to avoid conflicts with similar query params from other components
type DeploymentDataTableURLParams = {
  // filter
  t_keyword?: string;
  t_itis_tsn?: string;
  t_start_date?: string;
  t_end_date?: string;
  t_system_user_id?: number;
  t_device_serial?: string;
  t_species?: string;
  t_animal_alias?: string;
  // pagination
  t_page?: string;
  t_limit?: string;
  t_sort?: string;
  t_order?: 'asc' | 'desc';
};

const pageSizeOptions = [10, 25, 50];

interface IAllDeploymentListContainerProps {
  showSearch: boolean;
}

// Default pagination parameters
const initialPaginationParams: Required<ApiPaginationRequestOptions> = {
  page: 0,
  limit: 10,
  sort: 'acquisition_date',
  order: 'desc'
};

/**
 * Displays a list of deployment.
 *
 * @return {*}
 */
const DeploymentListContainer = (props: IAllDeploymentListContainerProps) => {
  const { showSearch } = props;

  const biohubApi = useBiohubApi();
  const codesContext = useCodesContext();

  const { searchParams, setSearchParams } = useSearchParams<StringValues<DeploymentDataTableURLParams>>();

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize: Number(searchParams.get('t_limit') ?? initialPaginationParams.limit),
    page: Number(searchParams.get('t_page') ?? initialPaginationParams.page)
  });

  const [sortModel, setSortModel] = useState<GridSortModel>([
    {
      field: searchParams.get('t_sort') ?? initialPaginationParams.sort ?? '',
      sort: (searchParams.get('t_order') ?? initialPaginationParams.order) as GridSortDirection
    }
  ]);

  const [advancedFiltersModel, setAdvancedFiltersModel] = useState<IFormDeploymentAdvancedFilters>({
    keyword: searchParams.get('t_keyword') ?? DeploymentAdvancedFiltersInitialValues.keyword,
    itis_tsn: searchParams.get('t_itis_tsn')
      ? Number(searchParams.get('t_itis_tsn'))
      : DeploymentAdvancedFiltersInitialValues.itis_tsn,
    start_date: searchParams.get('t_start_date') ?? DeploymentAdvancedFiltersInitialValues.start_date,
    end_date: searchParams.get('t_end_date') ?? DeploymentAdvancedFiltersInitialValues.end_date,
    system_user_id: searchParams.get('t_system_user_id')
      ? Number(searchParams.get('t_system_user_id'))
      : DeploymentAdvancedFiltersInitialValues.system_user_id
  });

  const sort = firstOrNull(sortModel);
  const paginationSort: ApiPaginationRequestOptions = {
    limit: paginationModel.pageSize,
    sort: sort?.field || undefined,
    order: sort?.sort || undefined,
    page: paginationModel.page + 1 // API pagination pages begin at 1, but MUI DataGrid pagination begins at 0.
  };

  const deploymentDataLoader = useDataLoader(
    (pagination?: ApiPaginationRequestOptions, filter?: IAllDeploymentAdvancedFilters) =>
      biohubApi.telemetryDeployment.findTelemetryDeployment(pagination, filter)
  );

  useDeepCompareEffect(() => {
    deploymentDataLoader.refresh(paginationSort, advancedFiltersModel);
  }, [advancedFiltersModel, paginationSort]);

  const rows = deploymentDataLoader.data?.deployments ?? [];

  const columns: GridColDef<TelemetryDeployment>[] = [
    {
      field: 'deployment_id',
      headerName: 'ID',
      minWidth: 200,
      sortable: false,
      renderHeader: () => (
        <Typography color={grey[500]} variant="body2" fontWeight={700}>
          ID
        </Typography>
      ),
      renderCell: (params) => (
        <Typography color={grey[500]} variant="body2">
          {params.row.deployment_id}
        </Typography>
      )
    },
    {
      field: 'serial',
      headerName: 'Device Serial',
      flex: 1,
      sortable: false,
      renderCell: (params) => <Typography variant="body2">{params.row.serial}</Typography>
    },
    {
      field: 'critterbase_critter_id',
      headerName: 'Animal Alias',
      flex: 1,
      sortable: false,
      renderCell: (params) => <Typography variant="body2">{params.row.critterbase_critter_id || 'N/A'}</Typography>
    },
    {
      field: 'device_make_id',
      headerName: 'Device Make',
      flex: 1,
      sortable: false,
      renderCell: (params) => {
        const deviceMake = codesContext.codesDataLoader.data?.telemetry_device_makes?.find(
          (make) => make.id === params.row.device_make_id
        );
        return <Typography variant="body2">{deviceMake?.name || 'N/A'}</Typography>;
      }
    },
    {
      field: 'attachment_start_date',
      headerName: 'Deployment Start',
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Typography variant="body2">
          {dayjs(params.row.attachment_start_date).format(DATE_FORMAT.MediumDateTimeFormat)}
        </Typography>
      )
    },
    {
      field: 'attachment_end_date',
      headerName: 'Deployment End',
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.row.attachment_end_date
            ? dayjs(params.row.attachment_end_date).format(DATE_FORMAT.MediumDateTimeFormat)
            : 'Ongoing'}
        </Typography>
      )
    },
    {
      field: 'survey_id',
      headerName: 'Survey ID',
      flex: 1,
      sortable: false,
      renderCell: (params) => <Typography variant="body2">{params.row.survey_id}</Typography>
    }
  ];

  return (
    <>
      <Collapse in={showSearch}>
        <Box py={2} px={2}>
          <DeploymentListFilterForm
            initialValues={advancedFiltersModel}
            handleSubmit={(values) => {
              setSearchParams(
                searchParams
                  .setOrDelete('t_keyword', values.keyword)
                  .setOrDelete('t_itis_tsn', values.itis_tsn)
                  .setOrDelete('t_start_date', values.start_date)
                  .setOrDelete('t_end_date', values.end_date)
                  .setOrDelete('t_system_user_id', values.system_user_id)
              );
              setAdvancedFiltersModel(values);
            }}
          />
        </Box>
        <Divider />
      </Collapse>

      <Box height="100vh" maxHeight="800px">
        <LoadingGuard
          isLoading={!rows.length && (deploymentDataLoader.isLoading || !deploymentDataLoader.isReady)}
          isLoadingFallback={<SkeletonTable />}
          isLoadingFallbackDelay={100}
          hasNoData={!rows.length}
          hasNoDataFallback={
            <NoDataOverlay
              height="500px"
              title="Create or Join Surveys to See Deployment Data"
              subtitle="You currently have no deployment data. Once you create or join surveys with deployment data, it will be displayed here"
              icon={mdiArrowTopRight}
            />
          }
          hasNoDataFallbackDelay={100}>
          <StyledDataGrid
            noRowsMessage="No deployments found"
            loading={!rows.length && (deploymentDataLoader.isLoading || !deploymentDataLoader.isReady)}
            // Columns
            columns={columns}
            // Rows
            rows={rows}
            rowCount={deploymentDataLoader.data?.pagination.total ?? 0}
            getRowId={(row) => row.deployment_id}
            // Pagination
            paginationMode="server"
            paginationModel={paginationModel}
            pageSizeOptions={pageSizeOptions}
            onPaginationModelChange={(model) => {
              if (!model) {
                return;
              }
              setSearchParams(searchParams.set('t_page', String(model.page)).set('t_limit', String(model.pageSize)));
              setPaginationModel(model);
            }}
            // Sorting
            sortingMode="server"
            sortModel={sortModel}
            sortingOrder={['asc', 'desc']}
            onSortModelChange={(model) => {
              if (!model.length) {
                return;
              }
              setSearchParams(searchParams.set('t_sort', model[0].field).set('t_order', model[0].sort ?? 'desc'));
              setSortModel(model);
            }}
            // Row options
            rowSelection={false}
            checkboxSelection={false}
            disableRowSelectionOnClick
            // Column options
            disableColumnSelector
            disableColumnFilter
            disableColumnMenu
            // Styling
            rowHeight={70}
            getRowHeight={() => 'auto'}
            autoHeight={false}
          />
        </LoadingGuard>
      </Box>
    </>
  );
};

export default DeploymentListContainer;
