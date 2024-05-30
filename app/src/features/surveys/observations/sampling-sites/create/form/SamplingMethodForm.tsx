import { mdiPencilOutline, mdiPlus, mdiTrashCanOutline } from '@mdi/js';
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
import grey from '@mui/material/colors/grey';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu, { MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { CodesContext } from 'contexts/codesContext';
import { ISurveySampleMethodData } from 'features/surveys/observations/sampling-sites/create/form/MethodForm';
import { useFormikContext } from 'formik';
import { ICreateSamplingSiteRequest } from 'interfaces/useSamplingSiteApi.interface';
import { useContext, useEffect, useState } from 'react';
import { TransitionGroup } from 'react-transition-group';
import { getCodesName } from 'utils/Utils';
import EditSamplingMethod from '../../edit/form/EditSamplingMethod';
import SamplingSiteListPeriod from '../../list/SamplingSiteListPeriod';
import CreateSamplingMethod from './CreateSamplingMethod';

/**
 * Returns a form for creating and editing a sampling method
 *
 * @returns
 */
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
    setEditData({ data: values.sample_methods[index], index });
  };

  const handleDelete = () => {
    if (editData) {
      const data = values.sample_methods;
      data.splice(editData.index, 1);
      setFieldValue('sample_methods', data);
    }
    setAnchorEl(null);
  };

  return (
    <>
      {/* CREATE SAMPLE METHOD DIALOG */}
      <CreateSamplingMethod
        open={isCreateModalOpen}
        onSubmit={(data) => {
          setFieldValue(`sample_methods[${values.sample_methods.length}]`, data);
          validateField('sample_methods');
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
            setFieldValue(`sample_methods[${editData?.index}]`, data);
            validateField('sample_methods');
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
          {errors.sample_methods && !Array.isArray(errors.sample_methods) && (
            <Alert
              sx={{
                mb: 2
              }}
              severity="error">
              <AlertTitle>Missing sampling method</AlertTitle>
              {errors.sample_methods}
            </Alert>
          )}
          <Stack component={TransitionGroup} gap={1.5}>
            {values.sample_methods.map((item, index) => (
              <Collapse key={`sample_method_${item.method_lookup_id || 0}`}>
                <Card
                  variant="outlined"
                  sx={{
                    background: grey[100],
                    '& .MuiCardHeader-root': {
                      pb: 1
                    }
                  }}>
                  <CardHeader
                    title={
                      <>
                        {getCodesName(codesContext.codesDataLoader.data, 'sample_methods', item.method_lookup_id || 0)}
                        <Typography component="span" variant="body2" color="textSecondary" ml={1}>
                          {getCodesName(
                            codesContext.codesDataLoader.data,
                            'method_response_metrics',
                            item.method_response_metric_id || 0
                          )}
                        </Typography>
                      </>
                    }
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
                      pb: '6px !important'
                    }}>
                    <Stack gap={2}>
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
                        <Typography variant="body2" fontWeight={700}>
                          Periods
                        </Typography>
                        <Divider component="div" sx={{ mt: 1 }}></Divider>
                        <Box sx={{ maxWidth: { xs: '100%', sm: '400px', xl: '300px' }, m: 1 }}>
                          <SamplingSiteListPeriod samplePeriods={item.sample_periods} />
                        </Box>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Collapse>
            ))}
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
