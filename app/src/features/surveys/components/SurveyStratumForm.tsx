import { mdiDotsVertical, mdiPencilOutline, mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Collapse from '@mui/material/Collapse';
import { grey } from '@mui/material/colors';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu, { MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { FormikProps, useFormikContext } from 'formik';
import { IEditSurveyRequest } from 'interfaces/useSurveyApi.interface';
import get from 'lodash-es/get';
import { useState } from 'react';
import { TransitionGroup } from 'react-transition-group';
import yup from 'utils/YupSchema';
import StratumCreateOrEditDialog from './StratumCreateOrEditDialog';
import { IStratum } from './SurveySiteSelectionForm';

export interface IStratumForm {
  index: number | null;
  stratum: IStratum;
}

export const StratumFormInitialValues: IStratumForm = {
  index: null,
  stratum: {
    name: '',
    description: ''
  }
};

export const StratumFormYupSchema = yup.object().shape({
  index: yup.number().nullable(true),
  stratum: yup.object().shape({
    survey_stratum_id: yup.number(),
    name: yup.string().required('Must provide a Stratum name').max(300, 'Name cannot exceed 300 characters'),
    description: yup
      .string()
      .required('Must provide a Stratum description')
      .max(3000, 'Description cannot exceed 3000 characters')
  })
});

/**
 * Create/edit survey - Funding section
 *
 * @return {*}
 */
const SurveyStratumForm = () => {
  const [currentStratumForm, setCurrentStratumForm] = useState<IStratumForm>(StratumFormInitialValues);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<MenuProps['anchorEl']>(null);

  const formikProps = useFormikContext<IEditSurveyRequest>();
  const { values, errors, handleSubmit, setFieldValue } = formikProps;

  const handleSave = (formikProps: FormikProps<IStratumForm> | null) => {
    if (!formikProps) {
      return;
    }

    const stratumForm = formikProps.values;

    if (stratumForm.index === null) {
      // Create new stratum
      setFieldValue('site_selection.stratums', [...values.site_selection.stratums, stratumForm.stratum]);
    } else {
      // Edit existing stratum
      setFieldValue(`site_selection.stratums[${stratumForm.index}`, stratumForm.stratum);
    }

    setDialogOpen(false);

    /**
     * Set the current stratum form to be the newly created stratum. This is so that
     * Formik will recognize an initial values change upon creating a subsequent stratum.
     */
    setCurrentStratumForm(stratumForm);
  };

  const handleCreateNewStratum = () => {
    setCurrentStratumForm(StratumFormInitialValues);
    setDialogOpen(true);
  };

  const handleClickContextMenu = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, index: number) => {
    setAnchorEl(event.currentTarget);
    setCurrentStratumForm({
      index,
      stratum: values.site_selection.stratums[index]
    });
  };

  const handleDelete = () => {
    setAnchorEl(null);
    setFieldValue(
      'site_selection.stratums',
      values.site_selection.stratums.filter((_stratum, index) => index !== currentStratumForm.index)
    );
  };

  const handleEdit = () => {
    setDialogOpen(true);
    setAnchorEl(null);
  };

  return (
    <>
      <StratumCreateOrEditDialog
        open={dialogOpen}
        onCancel={() => setDialogOpen(false)}
        stratumFormInitialValues={currentStratumForm}
        onSave={handleSave}
      />
      <Menu
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}>
        <MenuItem onClick={() => handleEdit()}>
          <ListItemIcon>
            <Icon path={mdiPencilOutline} size={1} />
          </ListItemIcon>
          Edit Details
        </MenuItem>
        <MenuItem onClick={() => handleDelete()}>
          <ListItemIcon>
            <Icon path={mdiTrashCanOutline} size={1} />
          </ListItemIcon>
          Remove Stratum
        </MenuItem>
      </Menu>
      <form onSubmit={handleSubmit}>
        {get(errors, 'site_selection.stratums') && (
          // Show array level error, if any
          <Box mb={2} ml={2}>
            <Typography style={{ fontSize: '12px', color: '#f44336' }}>
              {get(errors, 'site_selection.stratums') as string}
            </Typography>
          </Box>
        )}
        <TransitionGroup>
          {values.site_selection.stratums.map((stratum: IStratum, index: number) => {
            const key = `${stratum.name}-${index}`;

            return (
              <Collapse key={key}>
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
                      <IconButton onClick={(event) => handleClickContextMenu(event, index)} aria-label="settings">
                        <Icon path={mdiDotsVertical} size={1}></Icon>
                      </IconButton>
                    }
                    title={stratum.name}
                    subheader={stratum.description}
                  />
                </Card>
              </Collapse>
            );
          })}
        </TransitionGroup>
        <Button
          sx={{
            mt: 1
          }}
          data-testid="stratum-add-button"
          variant="outlined"
          color="primary"
          title="Create Stratum"
          aria-label="Create Stratum"
          startIcon={<Icon path={mdiPlus} size={1} />}
          onClick={() => handleCreateNewStratum()}>
          Add Stratum
        </Button>
      </form>
    </>
  );
};

export default SurveyStratumForm;
