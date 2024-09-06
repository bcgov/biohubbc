import { mdiCancel, mdiCheck, mdiExclamationThick } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup/ToggleButtonGroup';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { IGetAccessRequestsListResponse } from 'interfaces/useAdminApi.interface';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { useState } from 'react';
import AccessRequestActionedList from './list/actioned/AccessRequestActionedList';
import AccessRequestPendingList from './list/pending/AccessRequestPendingList';
import AccessRequestRejectedList from './list/rejected/AccessRequestRejectedList';

export interface IAccessRequestContainerProps {
  accessRequests: IGetAccessRequestsListResponse[];
  codes: IGetAllCodeSetsResponse;
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
  const { accessRequests, codes, refresh } = props;
  const [activeView, setActiveView] = useState<AccessRequestViewEnum>(AccessRequestViewEnum.PENDING);

  const views = [
    { value: AccessRequestViewEnum.PENDING, label: 'Pending', icon: mdiExclamationThick },
    { value: AccessRequestViewEnum.ACTIONED, label: 'Approved', icon: mdiCheck },
    { value: AccessRequestViewEnum.REJECTED, label: 'Rejected', icon: mdiCancel }
  ];

  const pendingRequests = accessRequests.filter((request) => request.status_name === 'Pending');
  const actionedRequests = accessRequests.filter((request) => request.status_name === 'Actioned');
  const rejectedRequests = accessRequests.filter((request) => request.status_name === 'Rejected');

  return (
    <Paper>
      <Toolbar>
        <Typography variant="h4" component="h2">
          Access Requests
        </Typography>
      </Toolbar>
      <Divider />
      <Box p={2} display="flex" justifyContent="space-between">
        <ToggleButtonGroup
          value={activeView}
          onChange={(_, view) => {
            if (!view) {
              // An active view must be selected at all times
              return;
            }

            setActiveView(view);
          }}
          exclusive
          sx={{
            width: '100%',
            gap: 1,
            '& Button': {
              py: 0.5,
              px: 1.5,
              border: 'none !important',
              fontWeight: 700,
              borderRadius: '4px !important',
              fontSize: '0.875rem',
              letterSpacing: '0.02rem'
            }
          }}>
          {views.map((view) => {
            const getCount = () => {
              switch (view.value) {
                case AccessRequestViewEnum.PENDING:
                  return pendingRequests.length;
                case AccessRequestViewEnum.ACTIONED:
                  return actionedRequests.length;
                case AccessRequestViewEnum.REJECTED:
                  return rejectedRequests.length;
                default:
                  return 0;
              }
            };
            return (
              <ToggleButton
                key={view.value}
                value={view.value}
                component={Button}
                color="primary"
                startIcon={<Icon path={view.icon} size={0.75} />}>
                {view.label} ({getCount()})
              </ToggleButton>
            );
          })}
        </ToggleButtonGroup>
      </Box>
      <Divider />
      <Box p={2}>
        {activeView === AccessRequestViewEnum.PENDING && (
          <AccessRequestPendingList accessRequests={pendingRequests} codes={codes} refresh={refresh} />
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
