import { mdiDotsVertical, mdiPencilOutline, mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import {
  Box,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  ListItemIcon,
  Menu,
  MenuItem,
  MenuProps,
  useMediaQuery,
  useTheme
} from '@mui/material';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CustomTextField from 'components/fields/CustomTextField';
import { Formik, FormikProps, useFormikContext } from 'formik';
import { IEditSurveyRequest } from 'interfaces/useSurveyApi.interface';
import { useRef, useState } from 'react';
import yup from 'utils/YupSchema';

interface IStratum {
  /**
   * @TODO We probably won't track the survey stratum ID in the frontend. Reason: new records won't have an ID.
   * From a technical perspective, it is much easier to simply erase all stratum and re-insert them upon
   * survey create/survey update, rather than track the IDs of already existing stratums.
   */

  // survey_stratum_id: number | undefined;
  name: string;
  description: string;
}

interface IStratumForm {
  index: number | null;
  stratum: IStratum;
}

const StratumFormInitialValues: IStratumForm = {
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

interface IStratumDialogProps {
  open: boolean;
  stratumFormInitialValues: IStratumForm;
  onCancel: () => void;
  onSave: (formikProps: FormikProps<IStratumForm> | null) => void;
}

const StratumDialog = (props: IStratumDialogProps) => {
  // const [currentStratum, setCurrentStratum] = useState<IStratumForm>(StratumFormInitialValues);

  const formikRef = useRef<FormikProps<IStratumForm>>(null);

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const handleCancel = () => {
    props.onCancel();
  };

  /*
  useEffect(() => {
    if (props.open) {
      setCurrentStratum(props.stratumFormInitialValues)
    }
  }, [props.stratumFormInitialValues, props.open]);
  */

  const editing = props.stratumFormInitialValues.index !== null;

  return (
    <Formik<IStratumForm>
      initialValues={props.stratumFormInitialValues}
      innerRef={formikRef}
      enableReinitialize={true}
      validationSchema={StratumFormYupSchema}
      validateOnBlur={true}
      validateOnChange={false}
      onSubmit={(values) => {
        props.onSave(formikRef.current);
      }}>
      {(formikProps) => {
        return (
          <Dialog open={props.open} fullScreen={fullScreen} maxWidth="xl" onClose={props.onCancel}>
            <DialogTitle>{editing ? 'Edit Stratum Details' : 'Add Stratum'}</DialogTitle>
            <DialogContent>
              <>
                <DialogContentText>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam at porttitor sem. Aliquam erat
                  volutpat. Donec placerat nisl magna, et faucibus arcu condimentum sed.
                </DialogContentText>
                <Box mt={4}>
                  <CustomTextField
                    other={{
                      sx: { mb: 4 },
                      required: true
                    }}
                    name="stratum.name"
                    label="Name"
                  />
                  <CustomTextField
                    other={{
                      multiline: true,
                      required: true,
                      rows: 5
                    }}
                    name="stratum.description"
                    label="Description"
                  />
                </Box>
              </>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => formikProps.submitForm()} variant="contained" color="primary">
                {editing ? 'Update' : 'Add Stratum'}
              </Button>
              <Button onClick={() => handleCancel()} variant="outlined">
                Cancel
              </Button>
            </DialogActions>
          </Dialog>
        );
      }}
    </Formik>
  );
};

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
      <StratumDialog
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
