import { mdiCheck, mdiExclamationThick, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import CustomToggleButtonGroup from 'components/toggle/CustomToggleButtonGroup';
import dayjs from 'dayjs';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { IAlertFilterParams } from 'interfaces/useAlertApi.interface';
import { useEffect, useMemo, useState } from 'react';
import { ApiPaginationRequestOptions } from 'types/misc';
import { firstOrNull } from 'utils/Utils';
import CreateAlert from './create/CreateAlert';
import DeleteAlert from './delete/DeleteAlert';
import EditAlert from './edit/EditAlert';
import AlertTable from './table/AlertTable';

enum AlertViewEnum {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED'
}

// Default pagination parameters
const initialPaginationParams: Required<ApiPaginationRequestOptions> = {
  page: 0,
  limit: 5,
  sort: 'alert_id',
  order: 'desc'
};

/**
 * Container for displaying a list of alerts created by system administrators
 *
 * @returns {*}
 */
const AlertListContainer = () => {
  const biohubApi = useBiohubApi();
  const [activeView, setActiveView] = useState<AlertViewEnum>(AlertViewEnum.ACTIVE);
  const [modalState, setModalState] = useState({
    create: false,
    edit: false,
    delete: false
  });
  const [alertId, setAlertId] = useState<number | null>(null);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize: initialPaginationParams.limit,
    page: initialPaginationParams.page
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([
    {
      field: initialPaginationParams.sort,
      sort: initialPaginationParams.order
    }
  ]);

  const paginationSort: ApiPaginationRequestOptions = useMemo(() => {
    const sort = firstOrNull(sortModel);
    return {
      limit: paginationModel.pageSize,
      sort: sort?.field || undefined,
      order: sort?.sort || undefined,
      page: paginationModel.page + 1 // API pagination pages begin at 1, but MUI DataGrid pagination begins at 0.
    };
  }, [paginationModel, sortModel]);

  const filters: IAlertFilterParams =
    activeView === AlertViewEnum.ACTIVE ? { expiresAfter: dayjs().format() } : { expiresBefore: dayjs().format() };

  const alertDataLoader = useDataLoader((filters: IAlertFilterParams, pagination: ApiPaginationRequestOptions) => {
    return biohubApi.alert.getAlerts(filters, pagination);
  });

  const closeModal = () => {
    alertDataLoader.refresh(filters, paginationSort);
    setModalState({ create: false, edit: false, delete: false });
    setAlertId(null);
  };

  useEffect(() => {
    alertDataLoader.refresh(filters, paginationSort);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginationSort]);

  return (
    <Paper>
      <Toolbar style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h4" component="h2">
          Alerts
        </Typography>
        <Button
          color="primary"
          variant="contained"
          startIcon={<Icon path={mdiPlus} size={1} />}
          onClick={() => setModalState((prev) => ({ ...prev, create: true }))}>
          Add Alert
        </Button>
      </Toolbar>
      <Divider />
      <Box p={2}>
        <CustomToggleButtonGroup
          views={[
            { value: AlertViewEnum.ACTIVE, label: 'Active', icon: mdiExclamationThick },
            { value: AlertViewEnum.EXPIRED, label: 'Expired', icon: mdiCheck }
          ]}
          activeView={activeView}
          onViewChange={(view) => {
            setActiveView(view);
            setPaginationModel({ ...initialPaginationParams, pageSize: initialPaginationParams.limit });
          }}
          orientation="horizontal"
        />
      </Box>
      <Divider />
      <Box>
        <CreateAlert open={modalState.create} onClose={closeModal} />
        {alertId && modalState.edit && <EditAlert alertId={alertId} open={modalState.edit} onClose={closeModal} />}
        {alertId && modalState.delete && (
          <DeleteAlert alertId={alertId} open={modalState.delete} onClose={closeModal} />
        )}

        <AlertTable
          alerts={alertDataLoader.data?.alerts.map((alert) => ({ ...alert, id: alert.alert_id })) ?? []}
          rowCount={alertDataLoader.data?.pagination.total ?? 0}
          paginationModel={paginationModel}
          setPaginationModel={setPaginationModel}
          sortModel={sortModel}
          setSortModel={setSortModel}
          onEdit={(id) => {
            setAlertId(id);
            setModalState((prev) => ({ ...prev, edit: true }));
          }}
          onDelete={(id) => {
            setAlertId(id);
            setModalState((prev) => ({ ...prev, delete: true }));
          }}
        />
      </Box>
    </Paper>
  );
};

export default AlertListContainer;
