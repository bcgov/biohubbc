import { mdiPencilOutline, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { Card, CardHeader, IconButton } from '@mui/material';
import { grey } from '@mui/material/colors';
import React from 'react';

interface EditDeleteStubCardProps {
  header: string;
  subHeaderData: Record<string, string | number | undefined>;
  onClickEdit: () => void;
  onClickDelete: () => void;
  disableTrashIcon?: boolean;
}
export const EditDeleteStubCard = ({
  header,
  subHeaderData,
  onClickEdit,
  onClickDelete,
  disableTrashIcon
}: EditDeleteStubCardProps) => {
  return (
    <Card
      variant="outlined"
      sx={{
        background: grey[100],
        '& .MuiCardHeader-subheader': {
          display: '-webkit-box',
          WebkitLineClamp: '2',
          WebkitBoxOrient: 'vertical',
          maxWidth: '92ch',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          fontSize: '14px'
        },
        mt: 1,
        '& .MuiCardHeader-title': {
          mb: 0.5
        }
      }}>
      <CardHeader
        action={
          <>
            <IconButton aria-label="settings" onClick={onClickEdit}>
              <Icon path={mdiPencilOutline} size={1} />
            </IconButton>
            {!disableTrashIcon && (
              <IconButton aria-label="settings" onClick={onClickDelete}>
                <Icon path={mdiTrashCanOutline} size={1} />
              </IconButton>
            )}
          </>
        }
        title={header}
        subheader={Object.entries(subHeaderData)
          .map((pairs, idx) => {
            const key = pairs[0];
            const value = pairs[1];
            return value ? `${key} • ${value}` : ``;
          })
          .join('  /  ')}
      />
    </Card>
  );
};
