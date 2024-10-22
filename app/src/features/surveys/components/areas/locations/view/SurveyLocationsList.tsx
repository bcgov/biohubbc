import { mdiPencilOutline, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import EditDialog from 'components/dialog/EditDialog';
import { useFormikContext } from 'formik';
import { IEditSurveyRequest } from 'interfaces/useSurveyApi.interface';
import React, { useState } from 'react';
import { TransitionGroup } from 'react-transition-group';
import SurveyLocationsListItem from '../../components/SurveyLocationsListItem';
import SurveyLocationsForm from '../form/SurveyLocationsForm';

import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import { v4 } from 'uuid';
import * as yup from 'yup';

export const SurveyLocationsYupSchema = yup.object().shape({
  locations: yup
    .array()
    .of(
      yup.object().shape({
        name: yup.string().max(100, 'Name cannot exceed 100 characters').required('Name is required'),
        description: yup.string().max(250, 'Description cannot exceed 250 characters').default(''),
        geojson: yup.array().min(1, 'A geometry is required').required('A geometry is required')
      })
    )
    .min(1, 'You must add at least one survey boundary to identify your area of interest.')
});

export const SurveyLocationsInitialValues = {
  locations: [
    {
      name: '',
      description: '',
      geojson: [],
      uuid: v4() // Unique ID for each location for formik key prop
    }
  ]
};

interface ISurveyLocationsListProps {
  checkboxSelectedIds: number[];
  handleCheckboxChange: (index: number[]) => void;
  handleDelete: (index: number) => void;
}

const SurveyLocationsList = (props: ISurveyLocationsListProps) => {
  const { handleDelete, handleCheckboxChange, checkboxSelectedIds } = props;

  const { values, setFieldValue } = useFormikContext<IEditSurveyRequest>();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [currentItemIndex, setCurrentItemIndex] = useState<number | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>, index: number) => {
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
    console.log('edit save!');
    if (currentItemIndex !== null) {
      const bounds = values.locations.map((bound, index) =>
        index === currentItemIndex ? { ...bound, ...formValues } : bound
      );
      setFieldValue('locations', bounds);
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
            element: <SurveyLocationsForm />,
            initialValues: values.locations[currentItemIndex] ?? SurveyLocationsInitialValues,
            validationSchema: SurveyLocationsYupSchema
          }}
          dialogSaveButtonLabel="Save"
          onCancel={closeEditDialog}
          onSave={handleEditSave}
        />
      )}

      {/* Survey Locations List */}
      <Box data-testid="study-area-list" display="flex" flexDirection="column" height="100%">
        <FormGroup>
          <FormControlLabel
            label={
              <Typography
                variant="body2"
                component="span"
                color="textSecondary"
                fontWeight={700}
                sx={{ textTransform: 'uppercase' }}>
                Select All
              </Typography>
            }
            control={
              <Checkbox
                sx={{ mr: 0.5, pl: 4, minHeight: '55px' }}
                checked={checkboxSelectedIds.length > 0 && checkboxSelectedIds.length === values.locations.length}
                indeterminate={checkboxSelectedIds.length >= 1 && checkboxSelectedIds.length < values.locations.length}
                onClick={() => {
                  if (checkboxSelectedIds.length === values.locations.length) {
                    handleCheckboxChange([]);
                    return;
                  }
                  const locationIndices = values.locations.map((_, index) => index);
                  handleCheckboxChange(locationIndices);
                }}
                inputProps={{ 'aria-label': 'controlled' }}
              />
            }
          />
        </FormGroup>
        <Divider />
        <List disablePadding>
          <TransitionGroup>
            {values.locations.map((item, index) => (
              <Collapse key={item.survey_location_id ?? item.uuid}>
                <SurveyLocationsListItem
                  item={item}
                  index={index}
                  onMenuClick={handleMenuClick}
                  checked={checkboxSelectedIds.includes(index)}
                  onCheckboxClick={() => {
                    const selectedIds = checkboxSelectedIds.includes(index)
                      ? checkboxSelectedIds.filter((idx) => idx !== index)
                      : [...checkboxSelectedIds, index];
                    handleCheckboxChange(selectedIds);
                  }}
                />
              </Collapse>
            ))}
          </TransitionGroup>
        </List>
      </Box>
    </>
  );
};

export default SurveyLocationsList;
