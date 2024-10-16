import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import PageHeader from 'components/layout/PageHeader';
import { AlertI18N } from 'constants/i18n';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import useDataLoaderError from 'hooks/useDataLoaderError';
import { useState } from 'react';
import CreateAlert from './create/CreateAlert';
import DeleteAlert from './delete/DeleteAlert';
import EditAlert from './edit/EditAlert';
import AlertTable from './table/AlertTable';

/**
 * Page to display a list of alerts.
 *
 * @return {*}
 */
const AlertListPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [alertId, setAlertId] = useState<number | null>();

  const biohubApi = useBiohubApi();

  const alertDataLoader = useDataLoader(() => biohubApi.alert.getAlerts());

  useDataLoaderError(alertDataLoader, (dataLoader) => {
    return {
      dialogTitle: AlertI18N.fetchAlertsErrorTitle,
      dialogText: AlertI18N.fetchAlertsErrorText,
      dialogError: (dataLoader.error as APIError).message,
      dialogErrorDetails: (dataLoader.error as APIError).errors
    };
  });

  alertDataLoader.load();

  const closeModal = (refresh?: boolean) => {
    if (refresh) {
      alertDataLoader.refresh();
    }
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setAlertId(null);
  };

  const openViewModal = (alertId: number) => {
    setAlertId(alertId);
  };

  if (!alertDataLoader.isReady) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <>
      {/* CREATE Alert MODAL */}
      <CreateAlert open={isCreateModalOpen} onClose={closeModal} />
      {/* EDIT Alert MODAL */}
      {alertId && isEditModalOpen && <EditAlert alertId={alertId} open={isEditModalOpen} onClose={closeModal} />}
      {/* DELETE Alert MODAL */}
      {alertId && isDeleteModalOpen && (
        <DeleteAlert alertId={alertId} open={isDeleteModalOpen} onClose={closeModal} openViewModal={openViewModal} />
      )}

      <PageHeader
        title="Alerts"
        buttonJSX={
          <Button
            variant="contained"
            color="primary"
            aria-label="Create Alert"
            startIcon={<Icon path={mdiPlus} size={1} />}
            onClick={() => setIsCreateModalOpen(true)}
            data-testid="funding-source-list-create-button">
            Create Alert
          </Button>
        }
      />

      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Paper>
          <Toolbar style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h4" component="h2" data-testid="funding-source-list-found">
              Records Found &zwnj;
              <Typography
                component="span"
                color="textSecondary"
                lineHeight="inherit"
                fontSize="inherit"
                fontWeight={400}>
                ({Number(alertDataLoader.data?.alerts.length ?? 0).toLocaleString()})
              </Typography>
            </Typography>
          </Toolbar>
          <Divider></Divider>
          <Box p={2}>
            <AlertTable
              alerts={alertDataLoader.data?.alerts ?? []}
              onView={(alertId) => {
                openViewModal(alertId);
              }}
              onEdit={(alertId) => {
                setAlertId(alertId);
                setIsEditModalOpen(true);
              }}
              onDelete={(alertId) => {
                setAlertId(alertId);
                setIsDeleteModalOpen(true);
              }}
            />
          </Box>
        </Paper>
      </Container>
    </>
  );
};

export default AlertListPage;
