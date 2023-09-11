import { mdiDotsVertical, mdiPencilOutline, mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import {
  Box,
  ListItemIcon,
  Menu,
  MenuItem,
  MenuProps
} from '@mui/material';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { FormikProps, useFormikContext } from 'formik';
import { IEditSurveyRequest } from 'interfaces/useSurveyApi.interface';
import { useState } from 'react';
import yup from 'utils/YupSchema';
import { IStratum } from './SurveySiteSelectionForm';
import StratumCreateOrEditDialog from './StratumCreateOrEditDialog';

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
  const { values, handleSubmit, setFieldValue } = formikProps;

  const handleSave = (formikProps: FormikProps<IStratumForm> | null) => {
    if (!formikProps) {
      return;
    }

    const stratumForm = formikProps.values;

    if (stratumForm.index === null) {
      // Create new stratum
      setFieldValue('site_selection_strategies.stratums', [
        ...values.site_selection_strategies.stratums,
        stratumForm.stratum
      ]);
    } else {
      // Edit existing stratum
      setFieldValue(`site_selection_strategies.stratums[${stratumForm.index}`, stratumForm.stratum);
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
      stratum: values.site_selection_strategies.stratums[index]
    });
  };

  const handleDelete = () => {
    setAnchorEl(null);
    setFieldValue(
      'site_selection_strategies.stratums',
      values.site_selection_strategies.stratums.filter((_stratum, index) => index !== currentStratumForm.index)
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
        <Box mt={4}>
          {values.site_selection_strategies.stratums.map((stratum: IStratum, index: number) => {
            return (
              <Box mt={2}>
                <Card variant="outlined">
                  <Box display="flex" alignItems="flex-start" px={2} py={1.5}>
                    <Box flex="1 1 auto">
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: '1',
                          WebkitBoxOrient: 'vertical',
                          mb: 1
                        }}>
                        {stratum.name}
                      </Typography>
                      <Typography
                        variant="subtitle2"
                        color="textSecondary"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: '2',
                          WebkitBoxOrient: 'vertical'
                        }}>
                        {stratum.description}
                      </Typography>
                    </Box>
                    <Box flex="0 0 auto">
                      <IconButton
                        sx={{ ml: 2 }}
                        aria-label="remove user from project team"
                        onClick={(event) => handleClickContextMenu(event, index)}>
                        <Icon path={mdiDotsVertical} size={1}></Icon>
                      </IconButton>
                    </Box>
                  </Box>
                </Card>
              </Box>
            );
          })}

          <Box mt={4}>
            <Button
              data-testid="stratum-add-button"
              variant="outlined"
              color="primary"
              title="Create Stratum"
              aria-label="Create Stratum"
              startIcon={<Icon path={mdiPlus} size={1} />}
              onClick={() => handleCreateNewStratum()}>
              Add Stratum
            </Button>
          </Box>
        </Box>
      </form>
    </>
  );
};

export default SurveyStratumForm;
