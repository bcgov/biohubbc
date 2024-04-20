import { mdiCalendarRangeOutline, mdiPencilOutline, mdiPlus, mdiTrashCanOutline } from '@mdi/js';
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
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu, { MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { CodesContext } from 'contexts/codesContext';
import { ISurveySampleMethodData } from 'features/surveys/observations/sampling-sites/create/form/MethodCreateForm';
import { useFormikContext } from 'formik';
import { ICreateSamplingSiteRequest } from 'interfaces/useSamplingSiteApi.interface';
import { useContext, useEffect, useState } from 'react';
import { TransitionGroup } from 'react-transition-group';
import { getCodesName } from 'utils/Utils';
import EditSamplingMethod from '../../edit/form/EditSamplingMethod';
import CreateSamplingMethod from './CreateSamplingMethod';

const SamplingMethodForm = () => {
  const { values, errors, setFieldValue, validateField } = useFormikContext<ICreateSamplingSiteRequest>();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<MenuProps['anchorEl']>(null);
  const [editData, setEditData] = useState<{ data: ISurveySampleMethodData; index: number } | undefined>(undefined);

  const codesContext = useContext(CodesContext);
  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, [codesContext.codesDataLoader]);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, index: number) => {
    setAnchorEl(event.currentTarget);
    setEditData({ data: values.methods[index], index });
  };

  const handleDelete = () => {
    if (editData) {
      const data = values.methods;
      data.splice(editData.index, 1);
      setFieldValue('methods', data);
    }
    setAnchorEl(null);
  };

  return (
    <>
      {/* CREATE SAMPLE METHOD DIALOG */}
      <CreateSamplingMethod
        open={isCreateModalOpen}
        onSubmit={(data) => {
          setFieldValue(`methods[${values.methods.length}]`, data);
          validateField('methods');
          setAnchorEl(null);
          setIsCreateModalOpen(false);
        }}
        onClose={() => {
          setAnchorEl(null);
          setIsCreateModalOpen(false);
        }}
      />

      {/* EDIT SAMPLE METHOD DIALOG */}
      {editData?.data && (
        <EditSamplingMethod
          initialData={editData?.data}
          open={isEditModalOpen}
          onSubmit={(data) => {
            setFieldValue(`methods[${editData?.index}]`, data);
            setAnchorEl(null);
            setIsEditModalOpen(false);
          }}
          onClose={() => {
            setAnchorEl(null);
            setIsEditModalOpen(false);
          }}
        />
      )}

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
        <MenuItem onClick={() => setIsEditModalOpen(true)}>
          <ListItemIcon>
            <Icon path={mdiPencilOutline} size={1} />
          </ListItemIcon>
          Edit Details
        </MenuItem>
        <MenuItem onClick={() => handleDelete()}>
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
              mb: 3,
              maxWidth: '92ch'
            }}>
            Methods added here will be applied to ALL sampling locations. These can be modified later if required.
          </Typography>
          {errors.methods && !Array.isArray(errors.methods) && (
            <Alert
              sx={{
                my: 1
              }}
              severity="error">
              <AlertTitle>Missing sampling method</AlertTitle>
              {errors.methods}
            </Alert>
          )}
          <Stack component={TransitionGroup} gap={1.5}>
            {values.methods.map((item, index) => {
              console.log(item);
              return (
                <Collapse key={`sample_method_${item.method_lookup_id || Math.random()}`}>
                  <Card
                    variant="outlined"
                    sx={{
                      background: grey[100]
                    }}>
                    <CardHeader
                      title={`${getCodesName(
                        codesContext.codesDataLoader.data,
                        'sample_methods',
                        item.method_lookup_id || 0
                      )}`}
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
                        pt: 0,
                        pb: '12px !important'
                      }}>
                      <Stack gap={3}>
                        {item.description && (
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: '2',
                              WebkitBoxOrient: 'vertical',
                              maxWidth: '92ch',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>
                            {item.description}
                          </Typography>
                        )}
                        <Box>
                          <Typography variant="body1" fontWeight={700}>
                            Time Periods
                          </Typography>
                          <Divider component="div" sx={{ mt: 1 }}></Divider>
                          <List dense disablePadding>
                            {item.sample_periods.map((period) => (
                              <ListItem
                                key={`sample_period_${period.survey_sample_period_id || Math.random()}`}
                                divider
                                disableGutters
                                sx={{ pl: 1.25 }}>
                                <ListItemIcon sx={{ minWidth: '32px' }}>
                                  <Icon path={mdiCalendarRangeOutline} size={0.75} />
                                </ListItemIcon>
                                <ListItemText
                                  primary={`${period.start_date} ${period.start_time || ''} - ${period.end_date} ${
                                    period.end_time || ''
                                  }`}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Collapse>
              );
            })}
            <Button
              sx={{
                alignSelf: 'flex-start'
              }}
              data-testid="create-sample-method-add-button"
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
          </Stack>
        </form>
      </Box>
    </>
  );
};

export default SamplingMethodForm;
