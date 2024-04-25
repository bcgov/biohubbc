import { mdiDotsVertical, mdiPlus } from '@mdi/js';
import { Icon } from '@mdi/react';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useAnimalPageContext } from 'hooks/useContext';
import { Link as RouterLink } from 'react-router-dom';

interface ISurveyAnimalListToolbarProps {
  animalCount: number;
  checkboxSelectedIdsLength: number;
}

const SurveyAnimaListToolbar = (props: ISurveyAnimalListToolbarProps) => {
  const animalPageContext = useAnimalPageContext();

  return (
    <Toolbar
      disableGutters
      sx={{
        flex: '0 0 auto',
        pr: 3,
        pl: 2
      }}>
      <Typography variant="h3" component="h2" flexGrow={1}>
        Animals &zwnj;
        <Typography sx={{ fontWeight: '400' }} component="span" variant="inherit" color="textSecondary">
          ({props.animalCount})
        </Typography>
      </Typography>
      <Button
        variant="contained"
        color="primary"
        component={RouterLink}
        to={'animals/create'}
        startIcon={<Icon path={mdiPlus} size={1} />}
        disabled={animalPageContext.isDisabled}>
        Add
      </Button>
      <IconButton
        edge="end"
        sx={{
          ml: 1
        }}
        aria-label="header-settings"
        disabled={!props.checkboxSelectedIdsLength}
        // onClick={handleHeaderMenuClick}
        title="Bulk Actions">
        <Icon path={mdiDotsVertical} size={1} />
      </IconButton>
    </Toolbar>
  );
};

export default SurveyAnimaListToolbar;
