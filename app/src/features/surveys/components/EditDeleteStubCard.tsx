import { mdiPencilOutline, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';

interface IEditDeleteStubCardProps {
  /*
   * title of the card
   */
  header: string;

  /*
   * sub header text of the card
   */
  subHeader?: string;

  /*
   * edit handler - undefined prevents edit action from rendering
   */
  onClickEdit?: () => void;

  /*
   * delete handler - undefined prevents delete action from rendering
   */
  onClickDelete?: () => void;
}

/**
 * Renders a card with title and sub header text with additional edit / delete controls inline
 *
 * @param {EditDeleteStubCardProps} props
 *
 * @return {*}
 *
 **/

export const EditDeleteStubCard = (props: IEditDeleteStubCardProps) => {
  const { header, subHeader, onClickEdit, onClickDelete } = props;
  return (
    <Card
      elevation={0}
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
              <IconButton data-testid="edit-icon" aria-label="edit" onClick={onClickEdit}>
                <Icon path={mdiPencilOutline} size={1} />
              </IconButton>
            )}
            {onClickDelete && (
              <IconButton data-testid="delete-icon" aria-label="delete" onClick={onClickDelete}>
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
