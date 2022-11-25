import { Chip } from '@material-ui/core';
import { mdiAlertCircle, mdiLockCheckOutline, mdiLockOpenCheckOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { AttachmentStatus } from 'constants/attachments';
import React from 'react';

interface IAttachmentStatusChip {
  status?: AttachmentStatus;
  securityRuleCount?: number;
}

const AttachmentStatusChip: React.FC<IAttachmentStatusChip> = (props) => {
  const { status, securityRuleCount } = props;

  let label = 'Submitted';
  let color: 'default' | 'primary' | 'secondary' | undefined = 'primary';
  let icon = undefined;

  switch (status) {
    case 'SUBMITTED':
      break;
    case 'PENDING_REVIEW':
      label = 'Pending review';
      color = 'secondary';
      icon = mdiAlertCircle;
      break;
    case 'SECURED':
      label = securityRuleCount ? `Secured (${securityRuleCount})` : 'Secured';
      color = 'default';
      icon = mdiLockCheckOutline;
      break;
    case 'UNSECURED':
      label = 'Unsecured';
      color = 'default';
      icon = mdiLockOpenCheckOutline;
      break;
  }

  return <Chip size="small" color={color} label={label} icon={icon ? <Icon path={icon} size={0.8} /> : undefined} />;
};

export default AttachmentStatusChip;
