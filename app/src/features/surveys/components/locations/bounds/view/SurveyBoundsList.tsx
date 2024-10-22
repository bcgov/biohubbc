import { mdiPencilOutline, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import { grey } from '@mui/material/colors';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu, { MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import EditDialog from 'components/dialog/EditDialog';
import { useFormikContext } from 'formik';
import { IEditSurveyRequest } from 'interfaces/useSurveyApi.interface';
import { useState } from 'react';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import yup from 'utils/YupSchema';
import { v4 } from 'uuid';
import SurveyBoundsForm, { ISurveyBound } from '../form/SurveyBoundsForm';

export const SurveyBoundsYupSchema = yup.object({
  bounds: yup
    .array(
      yup.object({
        name: yup.string().max(100, 'Name cannot exceed 100 characters').required('Name is Required'),
        description: yup.string().max(250, 'Description cannot exceed 250 characters').default(''),
        geojson: yup.array().min(1, 'A geometry is required').required('A geometry is required')
      })
    )
    .min(1, 'You must add at least one boundary to identify your area of interest.')
});

export const SurveyBoundsInitialValues = {
  name: '',
  description: '',
  uuid: v4()
};

interface ISurveyBoundsListProps {
  handleDelete: (index: number) => void;
}

export const SurveyBoundsList = (props: ISurveyBoundsListProps) => {
  const { handleDelete } = props;
  const { values, setFieldValue } = useFormikContext<IEditSurveyRequest>();

  const [anchorEl, setAnchorEl] = useState<MenuProps['anchorEl']>(null);
  const [currentItemIndex, setCurrentItemIndex] = useState<number | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, index: number) => {
    setAnchorEl(event.currentTarget);
    setCurrentItemIndex(index);
  };

  const openEditDialog = () => {
    if (currentItemIndex !== null) {
      setIsEditOpen(true);
      setAnchorEl(null);
    }
  };

  const closeEditDialog = () => {
    setIsEditOpen(false);
  };

  const handleEditSave = (formValues: { name: string; description: string }) => {
    if (currentItemIndex !== null) {
      const bounds = values.bounds.map((bound, index) =>
        index === currentItemIndex ? { ...bound, ...formValues } : bound
      );
      setFieldValue('bounds', bounds);
    }
    closeEditDialog();
  };

  return (
    <>
      {/* CONTEXT MENU */}
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
        <MenuItem onClick={openEditDialog}>
          <ListItemIcon>
            <Icon path={mdiPencilOutline} size={1} />
          </ListItemIcon>
          Edit Details
        </MenuItem>
        <MenuItem
          onClick={() => {
            console.log(currentItemIndex);
            if (currentItemIndex != null) {
              handleDelete(currentItemIndex);
            }
            setAnchorEl(null);
          }}>
          <ListItemIcon>
            <Icon path={mdiTrashCanOutline} size={1} />
          </ListItemIcon>
          Remove
        </MenuItem>
      </Menu>

      {/* Edit Dialog */}
      {currentItemIndex != null && (
        <EditDialog
          dialogTitle={'Edit Location Details'}
          open={isEditOpen}
          dialogLoading={false}
          component={{
            element: <SurveyBoundsForm />,
            initialValues: values.bounds[currentItemIndex] ?? SurveyBoundsInitialValues,
            validationSchema: SurveyBoundsYupSchema
          }}
          dialogSaveButtonLabel="Save"
          onCancel={closeEditDialog}
          onSave={handleEditSave}
        />
      )}

      {/* Survey Bounds List */}
      <Box data-testid="study-area-list" display="flex" flexDirection="column" height="100%">
        <List component={TransitionGroup} disablePadding>
          {values.bounds.map((item: ISurveyBound, index: number) => {
            console.log(index);
            return (
              <Collapse
                key={item.survey_location_id ?? item.uuid}
                className="study-area-list-item"
                sx={{
                  '& + .study-area-list-item': {
                    borderTop: '1px solid' + grey[300]
                  }
                }}>
                <ListItem
                  component="div"
                  secondaryAction={
                    <IconButton
                      onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) =>
                        handleMenuClick(event, index)
                      }
                      aria-label="settings">
                      <MoreVertIcon />
                    </IconButton>
                  }
                  sx={{ minHeight: '55px' }}>
                  <ListItemText
                    sx={{
                      '& .MuiListItemText-primary': {
                        fontWeight: 700
                      },
                      '& .MuiListItemText-secondary': {
                        display: '-webkit-box',
                        WebkitLineClamp: '2',
                        WebkitBoxOrient: 'vertical',
                        maxWidth: '92ch',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }
                    }}
                    primary={item.name}
                    secondary={item.description}
                  />
                </ListItem>
              </Collapse>
            );
          })}
        </List>
      </Box>
    </>
  );
};
