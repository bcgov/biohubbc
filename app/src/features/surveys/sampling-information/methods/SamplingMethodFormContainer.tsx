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
import blueGrey from '@mui/material/colors/blueGrey';
import grey from '@mui/material/colors/grey';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu, { MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ColouredRectangleChip from 'components/chips/ColouredRectangleChip';
import { CodesContext } from 'contexts/codesContext';
import { ISurveySampleMethodFormData } from 'features/surveys/sampling-information/methods/components/SamplingMethodForm';
import { CreateSamplingMethodFormDialog } from 'features/surveys/sampling-information/methods/create/CreateSamplingMethodFormDialog';
import { EditSamplingMethodFormDialog } from 'features/surveys/sampling-information/methods/edit/EditSamplingMethodFormDialog';
import { SamplingPeriodFormContainer } from 'features/surveys/sampling-information/periods/SamplingPeriodFormContainer';
import { ICreateSampleSiteFormData } from 'features/surveys/sampling-information/sites/create/CreateSamplingSitePage';
import { IEditSampleSiteFormData } from 'features/surveys/sampling-information/sites/edit/EditSamplingSitePage';
import { useFormikContext } from 'formik';
import { useSurveyContext } from 'hooks/useContext';
import { useContext, useEffect, useState } from 'react';
import { TransitionGroup } from 'react-transition-group';
import { getCodesName } from 'utils/Utils';

/**
 * Returns a form for creating and editing a sampling method
 *
 * @returns
 */
export const SamplingMethodFormContainer = () => {
  const { values, errors, setFieldValue, setFieldTouched } = useFormikContext<
    ICreateSampleSiteFormData | IEditSampleSiteFormData
  >();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<MenuProps['anchorEl']>(null);
  const [editData, setEditData] = useState<{ data: ISurveySampleMethodFormData; index: number } | undefined>(undefined);

  const surveyContext = useSurveyContext();

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
      <CreateSamplingMethodFormDialog
        open={isCreateModalOpen}
        onSubmit={(data) => {
          setFieldValue(`sample_methods[${values.sample_methods.length}]`, data);
          setFieldTouched('sample_methods', true, false);
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
        <EditSamplingMethodFormDialog
          initialData={editData?.data}
          open={isEditModalOpen}
          onSubmit={(data) => {
            setFieldValue(`sample_methods[${editData?.index}]`, data);
            setFieldTouched('sample_methods', true, false);
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
          <Typography component="legend">Add Sampling Techniques</Typography>
          <Typography
            variant="body1"
            color="textSecondary"
            sx={{
              mb: 3,
              maxWidth: '92ch'
            }}>
            Techniques added here will be applied to ALL sampling locations. These can be modified later if required.
          </Typography>
          {errors.sample_methods && !Array.isArray(errors.sample_methods) && (
            <Alert
              sx={{
                mb: 2
              }}
              severity="error">
              <AlertTitle>Missing sampling technique</AlertTitle>
              {errors.sample_methods}
            </Alert>
          )}
          <Stack component={TransitionGroup} gap={1.5}>
            {values.sample_methods.map((sampleMethod, index) => {
              return (
                <Collapse
                  key={`sample_method_${
                    sampleMethod.survey_sample_method_id ?? ('_id' in sampleMethod && sampleMethod._id) ?? index
                  }`}>
                  <Card
                    variant="outlined"
                    sx={{
                      background: grey[50],
                      border: `1px solid ${grey[400]}`,
                      '& .MuiCardHeader-root': {
                        pb: 1
                      },
                      pb: 2
                    }}>
                    <CardHeader
                      title={
                        <Box display="flex">
                          <Typography component="span" variant="h5">
                            {
                              surveyContext.techniqueDataLoader.data?.techniques.find(
                                (technique) =>
                                  technique.method_technique_id === sampleMethod.technique.method_technique_id
                              )?.name
                            }
                          </Typography>
                          <Box sx={{ ml: 1 }}>
                            <ColouredRectangleChip
                              colour={blueGrey}
                              label={
                                getCodesName(
                                  codesContext.codesDataLoader.data,
                                  'method_response_metrics',
                                  sampleMethod.method_response_metric_id || 0
                                ) ?? ''
                              }
                            />
                          </Box>
                        </Box>
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
                        {sampleMethod.description && (
                          <Typography
                            color="textSecondary"
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: '2',
                              WebkitBoxOrient: 'vertical',
                              maxWidth: '92ch',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>
                            {sampleMethod.description}
                          </Typography>
                        )}
                        <Divider sx={{ mt: 0.5 }} />
                        <Box py={1}>
                          {sampleMethod.technique.method_technique_id && (
                            <SamplingPeriodFormContainer index={index} survey_sample_method={sampleMethod} />
                          )}
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Collapse>
              );
            })}

            <Button
              sx={{
                alignSelf: 'flex-start',
                mt: 1
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
              Add Technique
            </Button>
          </Stack>
        </form>
      </Box>
    </>
  );
};
