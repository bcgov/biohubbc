import { mdiCalendarRangeOutline, mdiPencilOutline, mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
  CardContent,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  MenuProps
} from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import { grey } from '@mui/material/colors';
import Typography from '@mui/material/Typography';
import { useFormikContext } from 'formik';
import { useState } from 'react';
import { ICreateSamplingSiteRequest } from '../observations/sampling-sites/SamplingSitePage';
import CreateSamplingMethod from './CreateSamplingMethod';
import EditSamplingMethod from './EditSamplingMethod';
import { IEditSurveySampleMethodData } from './MethodForm';

const SamplingMethodForm = () => {
  const { values, errors, setFieldValue, validateField } = useFormikContext<ICreateSamplingSiteRequest>();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<MenuProps['anchorEl']>(null);
  const [editData, setEditData] = useState<IEditSurveySampleMethodData | undefined>(undefined);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, index: number) => {
    setAnchorEl(event.currentTarget);
    setEditData({ ...values.methods[index], index });
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
          setFieldValue(`methods[${index}]`, data);
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
          <Typography component="legend">Specify Sampling Methods</Typography>
          <Typography
            variant="body1"
            color="textSecondary"
            sx={{
              maxWidth: '72ch'
            }}>
            Methods defined below will be applied to all imported sampling sites boundaries. This information can be
            modified later if required.
          </Typography>
          {errors.methods && !Array.isArray(errors.methods) && (
            <Box pt={2}>
              <Typography style={{ fontSize: '12px', color: '#f44336' }}>{errors.methods}</Typography>
            </Box>
          )}
          <Button
            sx={{
              mt: 1
            }}
            data-testid="sample-method-add-button"
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

          {values.methods.map((item, index) => (
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
                title={`Sampling Method ${index + 1}`}
                subheader={item.description}
                action={
                  <IconButton
                    onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => handleMenuClick(event, index)}
                    aria-label="settings">
                    <MoreVertIcon />
                  </IconButton>
                }
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  Time Periods
                </Typography>
                <List dense>
                  {item.periods.map((period) => (
                    <>
                      <Divider />
                      <ListItem>
                        <ListItemIcon>
                          <Icon path={mdiCalendarRangeOutline} size={1} />
                        </ListItemIcon>
                        <ListItemText primary={`${period.start_date} to ${period.end_date}`} />
                      </ListItem>
                    </>
                  ))}
                </List>
              </CardContent>
            </Card>
          ))}
        </form>
      </Box>
    </>
  );
};

export default SamplingMethodForm;
