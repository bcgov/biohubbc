import { mdiPencilOutline, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { Card, CardHeader, IconButton } from '@mui/material';

interface EditDeleteStubCardProps {
  header: string;
  subHeader: string;
  onClickEdit?: () => void;
  onClickDelete?: () => void;
}

export const EditDeleteStubCard = ({ header, subHeader, onClickEdit, onClickDelete }: EditDeleteStubCardProps) => {
  return (
    <Card
      sx={{
        mb: 1,
        '& .MuiCardHeader-subheader': {
          display: '-webkit-box',
          WebkitLineClamp: '2',
          WebkitBoxOrient: 'vertical',
          maxWidth: '92ch',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          fontSize: '14px'
        },
        '& .MuiCardHeader-title': {
          mb: 0.5
        }
      }}>
      <CardHeader
        action={
          <>
            {onClickEdit && (
              <IconButton aria-label="settings" onClick={onClickEdit}>
                <Icon path={mdiPencilOutline} size={1} />
              </IconButton>
            )}
            {onClickDelete && (
              <IconButton aria-label="settings" onClick={onClickDelete}>
                <Icon path={mdiTrashCanOutline} size={1} />
              </IconButton>
            )}
          </>
        }
        title={header}
        subheader={subHeader}
      />
    </Card>
  );
};
