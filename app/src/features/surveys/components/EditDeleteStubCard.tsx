import { mdiPencilOutline, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { Card, CardHeader, IconButton } from '@mui/material';

export type ISubHeaderData = Record<string, string | number | undefined> | string;

interface EditDeleteStubCardProps {
  header: string;
  subHeaderData: ISubHeaderData;
  onClickEdit?: () => void;
  onClickDelete?: () => void;
}

export const EditDeleteStubCard = ({ header, subHeaderData, onClickEdit, onClickDelete }: EditDeleteStubCardProps) => {
  const formatSubHeaderString = (subHeaderData: ISubHeaderData) => {
    const formatArr: string[] = [];
    const entries = Object.entries(subHeaderData);
    entries.forEach(([key, value]) => {
      if (value == null || value === '') {
        return;
      }
      formatArr.push(`${key} • ${value}`);
    });
    return formatArr.join(' | ');
  };

  return (
    <Card
      sx={{
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
        subheader={typeof subHeaderData === 'string' ? subHeaderData : formatSubHeaderString(subHeaderData)}
      />
    </Card>
  );
};
