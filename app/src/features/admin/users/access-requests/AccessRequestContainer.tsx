import { mdiCancel, mdiCheck, mdiExclamationThick } from '@mdi/js';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import CustomToggleButtonGroup from 'components/toolbar/CustomToggleButtonGroup';
import { IGetAccessRequestsListResponse } from 'interfaces/useAdminApi.interface';
import { useState } from 'react';
import AccessRequestActionedList from './list/actioned/AccessRequestActionedList';
import AccessRequestPendingList from './list/pending/AccessRequestPendingList';
import AccessRequestRejectedList from './list/rejected/AccessRequestRejectedList';

interface IAccessRequestContainerProps {
  accessRequests: IGetAccessRequestsListResponse[];
  refresh: () => void;
}

enum AccessRequestViewEnum {
  ACTIONED = 'ACTIONED',
  PENDING = 'PENDING',
  REJECTED = 'REJECTED'
}

/**
 * Container for displaying a list of user access requests.
 *
 */
const AccessRequestContainer = (props: IAccessRequestContainerProps) => {
  const { accessRequests, refresh } = props;

  const [activeView, setActiveView] = useState<AccessRequestViewEnum>(AccessRequestViewEnum.PENDING);

  const pendingRequests = accessRequests.filter((request) => request.status_name === 'Pending');
  const actionedRequests = accessRequests.filter((request) => request.status_name === 'Actioned');
  const rejectedRequests = accessRequests.filter((request) => request.status_name === 'Rejected');

  const views = [
    { value: AccessRequestViewEnum.PENDING, label: `Pending (${pendingRequests.length})`, icon: mdiExclamationThick },
    { value: AccessRequestViewEnum.ACTIONED, label: `Approved (${actionedRequests.length})`, icon: mdiCheck },
    { value: AccessRequestViewEnum.REJECTED, label: `Rejected (${rejectedRequests.length})`, icon: mdiCancel }
  ];

  return (
    <Paper>
      <Toolbar>
        <Typography variant="h4" component="h2">
          Access Requests
        </Typography>
      </Toolbar>
      <Divider />
      <Box p={2} display="flex" justifyContent="space-between">
        <CustomToggleButtonGroup
          views={views}
          activeView={activeView}
          onViewChange={(view) => {
            setActiveView(view);
          }}
          orientation="horizontal"
        />
      </Box>
      <Divider />
      <Box>
        {activeView === AccessRequestViewEnum.PENDING && (
          <AccessRequestPendingList accessRequests={pendingRequests} refresh={refresh} />
        )}
        {activeView === AccessRequestViewEnum.ACTIONED && (
          <AccessRequestActionedList accessRequests={actionedRequests} />
        )}
        {activeView === AccessRequestViewEnum.REJECTED && (
          <AccessRequestRejectedList accessRequests={rejectedRequests} />
        )}
      </Box>
    </Paper>
  );
};

export default AccessRequestContainer;
