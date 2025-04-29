import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import PageHeader from 'components/layout/PageHeader';
import { SystemRoleGuard } from 'components/security/Guards';
import { SYSTEM_ROLE } from 'constants/roles';
import { SystemAlertBanner } from 'features/alert/banner/SystemAlertBanner';
import { ListDataTableContainer } from 'features/summary/list-data/ListDataTableContainer';
import { SystemAlertBannerEnum } from 'interfaces/useAlertApi.interface';
import { Link as RouterLink } from 'react-router-dom';

/**
 * Page to display a summary of a user's field data.
 *
 * @return {*}
 */
const SummaryPage = () => {
  return (
    <>
      <PageHeader
        title="Overview"
        buttonJSX={
          <SystemRoleGuard
            validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.PROJECT_CREATOR, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Icon path={mdiPlus} size={1} />}
              component={RouterLink}
              to={'/admin/surveys/create'}>
              Create Survey
            </Button>
          </SystemRoleGuard>
        }
      />

      <Container maxWidth="xl" sx={{ py: 3 }}>
        <SystemAlertBanner alertTypes={[SystemAlertBannerEnum.SUMMARY]} />
        <Paper>
          <ListDataTableContainer />
        </Paper>
      </Container>
    </>
  );
};

export default SummaryPage;
