import { mdiCalendarRangeOutline, mdiClockOutline, mdiPencilOutline, mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Collapse from '@mui/material/Collapse';
import { grey } from '@mui/material/colors';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu, { MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { CodesContext } from 'contexts/codesContext';
import CreateSamplingMethod from 'features/surveys/components/CreateSamplingMethod';
import EditSamplingMethod from 'features/surveys/components/EditSamplingMethod';
import { IEditSurveySampleMethodData } from 'features/surveys/components/MethodForm';
import { useFormikContext } from 'formik';
import { useContext, useEffect, useState } from 'react';
import { TransitionGroup } from 'react-transition-group';
import { getCodesName } from 'utils/Utils';
import { IEditSamplingSiteRequest } from './SampleSiteEditForm';

export interface SampleMethodEditFormProps {
  name: string;
}

const SampleMethodEditForm = (props: SampleMethodEditFormProps) => {
  const { name } = props;

  const { values, errors, setFieldValue, validateField } = useFormikContext<IEditSamplingSiteRequest>();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<MenuProps['anchorEl']>(null);
  const [editData, setEditData] = useState<IEditSurveySampleMethodData | undefined>(undefined);

  const codesContext = useContext(CodesContext);
  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, [codesContext.codesDataLoader]);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, index: number) => {
    setAnchorEl(event.currentTarget);
    setEditData({ ...values.sampleSite.methods[index], index });
  };

  const handleDelete = () => {
    if (editData) {
      const methods = values.sampleSite.methods;
      methods.splice(editData.index, 1);
      setFieldValue('methods', methods);
    }
    setAnchorEl(null);
  };

  return (
    <>
      {/* CREATE SAMPLE METHOD DIALOG */}
      <CreateSamplingMethod
        open={isCreateModalOpen}
        onSubmit={(data) => {
          setFieldValue(`${name}[${values.sampleSite.methods.length}]`, data);
          validateField(`${name}`);
          setIsCreateModalOpen(false);
        }}
        onClose={() => {
          setIsCreateModalOpen(false);
        }}
      />

      {/* EDIT SAMPLE METHOD DIALOG */}
      <EditSamplingMethod
        initialData={editData}
        open={isEditModalOpen}
        onSubmit={(data, index) => {
          setFieldValue(`${name}[${index}]`, data);
          setIsEditModalOpen(false);
        }}
        onClose={() => {
          setIsEditModalOpen(false);
        }}
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
        <MenuItem key={'edit-details'} onClick={() => setIsEditModalOpen(true)}>
          <ListItemIcon>
            <Icon path={mdiPencilOutline} size={1} />
          </ListItemIcon>
          Edit Details
        </MenuItem>
        <MenuItem key={'remove-details'} onClick={() => handleDelete()}>
          <ListItemIcon>
            <Icon path={mdiTrashCanOutline} size={1} />
          </ListItemIcon>
          Remove
        </MenuItem>
      </Menu>

      <Box component="fieldset">
        <form>
          <Typography component="legend">Add Sampling Methods</Typography>
          <Typography
            variant="body1"
            color="textSecondary"
            sx={{
              mb: 2,
              maxWidth: '92ch'
            }}>
            Methods added here will be applied to ALL sampling locations. These can be modified later if required.
          </Typography>
          {errors?.sampleSite && errors.sampleSite.methods && !Array.isArray(errors.sampleSite.methods) && (
            <Alert
              sx={{
                my: 1
              }}
              severity="error">
              <AlertTitle>Missing sampling method</AlertTitle>
              {errors.sampleSite.methods}
            </Alert>
          )}
          <TransitionGroup>
            {values.sampleSite.methods.map((item, index) => (
              <Collapse key={`${item.survey_sample_method_id}`}>
                <Card
                  variant="outlined"
                  sx={{
                    mt: 1,
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
                    '& .MuiCardHeader-title': {
                      mb: 0.5
                    }
                  }}>
                  <CardHeader
                    title={`${getCodesName(
                      codesContext.codesDataLoader.data,
                      'sample_methods',
                      item.method_lookup_id || 0
                    )}`}
                    subheader={item.description}
                    action={
                      <IconButton
                        onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) =>
                          handleMenuClick(event, index)
                        }
                        aria-label="settings">
                        <MoreVertIcon />
                      </IconButton>
                    }
                  />
                  <CardContent
                    sx={{
                      pt: 1,
                      pb: '12px !important'
                    }}>
                    <Typography
                      variant="body2"
                      sx={{
                        m: 0,
                        px: 2,
                        py: 1,
                        backgroundColor: grey[200]
                      }}>
                      Time Periods
                    </Typography>
                    <List dense disablePadding>
                      {item.periods.map((period) => (
                        <ListItem key={`sample_period_${period.survey_sample_period_id}`} divider>
                          <ListItemIcon>
                            <Icon path={mdiCalendarRangeOutline} size={1} />
                          </ListItemIcon>
                          <ListItemText primary={`${period.start_date} to ${period.end_date}`} />
                          <ListItemIcon>
                            <Icon path={mdiClockOutline} size={1} />
                          </ListItemIcon>
                          <ListItemText primary={`${period.start_time} to ${period.end_time}`} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Collapse>
            ))}
          </TransitionGroup>
          <Button
            sx={{
              mt: 1
            }}
            data-testid="edit-sample-method-add-button"
            variant="outlined"
            color="primary"
            title="Add Sample Method"
            aria-label="Add Sample Method"
            startIcon={<Icon path={mdiPlus} size={1} />}
            onClick={() => {
              setIsCreateModalOpen(true);
            }}>
            Add Method
          </Button>
        </form>
      </Box>
    </>
  );
};

export default SampleMethodEditForm;
