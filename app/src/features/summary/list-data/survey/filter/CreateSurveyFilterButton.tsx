import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import grey from '@mui/material/colors/grey';
import IconButton from '@mui/material/IconButton';
import { useState } from 'react';
import CreateSurveyFilterDialog from './dialog/CreateSurveyFilterDialog';

interface ICreateSurveyFilterButtonProps {
  onSubmit: () => void;
}

/**
 * Button for opening a dialog for creating new survey filters
 *
 * @returns {*}
 */
export const CreateSurveyFilterButton = (props: ICreateSurveyFilterButtonProps) => {
  const { onSubmit } = props;
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <IconButton
        sx={{ borderRadius: '6px' }}
        onClick={() => {
          setIsDialogOpen(true);
        }}>
        <Icon path={mdiPlus} size={1} color={grey[500]} />
      </IconButton>
      {isDialogOpen && (
        <CreateSurveyFilterDialog
          open={isDialogOpen}
          onSubmit={() => {
            onSubmit();
            setIsDialogOpen(false);
          }}
          onClose={() => {
            setIsDialogOpen(false);
          }}
        />
      )}
    </>
  );
};
