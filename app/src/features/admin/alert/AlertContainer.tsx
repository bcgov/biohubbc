import { mdiCheck, mdiExclamationThick, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import CustomToggleButtonGroup from 'components/toolbar/CustomToggleButtonGroup';
import dayjs from 'dayjs';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { IAlertFilterParams } from 'interfaces/useAlertApi.interface';
import { useEffect, useState } from 'react';
import CreateAlert from './create/CreateAlert';
import DeleteAlert from './delete/DeleteAlert';
import EditAlert from './edit/EditAlert';
import AlertTable from './table/AlertTable';

enum AlertViewEnum {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED'
}

/**
 * Container for displaying a list of alerts created by system administrators
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

  const filters: IAlertFilterParams =
    activeView === AlertViewEnum.ACTIVE ? { expiresAfter: dayjs().format() } : { expiresBefore: dayjs().format() };

  // Load alerts based on filters
  const alertDataLoader = useDataLoader((filters: IAlertFilterParams) => biohubApi.alert.getAlerts(filters));

  // Define views
  const views = [
    { value: AlertViewEnum.ACTIVE, label: 'Active', icon: mdiExclamationThick },
    { value: AlertViewEnum.EXPIRED, label: 'Expired', icon: mdiCheck }
  ];

  const closeModal = () => {
    alertDataLoader.refresh(filters);
    setModalState({ create: false, edit: false, delete: false });
    setAlertId(null);
  };

  useEffect(() => {
    alertDataLoader.refresh(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeView]);

  return (
    <Paper>
      <Toolbar style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h4" component="h2">
          Alerts&nbsp;
        </Typography>
        <Button
          color="primary"
          variant="contained"
          data-testid="invite-system-users-button"
          aria-label="Add Users"
          startIcon={<Icon path={mdiPlus} size={1} />}
          onClick={() => setModalState((prev) => ({ ...prev, create: true }))}>
          Add Alert
        </Button>
      </Toolbar>
      <Divider />
      <Box p={2}>
        <CustomToggleButtonGroup
          views={views}
          activeView={activeView}
          onViewChange={(view) => setActiveView(view)}
          orientation="horizontal"
        />
      </Box>
      <Divider />
      <Box>
        {/* Modals */}
        <CreateAlert open={modalState.create} onClose={closeModal} />
        {alertId && modalState.edit && <EditAlert alertId={alertId} open={modalState.edit} onClose={closeModal} />}
        {alertId && modalState.delete && (
          <DeleteAlert alertId={alertId} open={modalState.delete} onClose={closeModal} />
        )}

        <AlertTable
          alerts={alertDataLoader.data?.alerts ?? []}
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
