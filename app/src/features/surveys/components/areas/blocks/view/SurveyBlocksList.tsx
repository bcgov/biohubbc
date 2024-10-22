import { mdiPencilOutline, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import List from '@mui/material/List';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu, { MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import EditDialog from 'components/dialog/EditDialog';
import { useFormikContext } from 'formik';
import { useState } from 'react';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import yup from 'utils/YupSchema';
import SurveyLocationListItem from '../../components/SurveyLocationsListItem';
import SurveyBlocksForm, { ISurveyBlock } from '../form/SurveyBlocksForm';

export const SurveyBlocksYupSchema = yup.object({
  blocks: yup.array(
    yup.object({
      name: yup.string().max(100, 'Name cannot exceed 100 characters').required('Name is Required'),
      description: yup.string().max(250, 'Description cannot exceed 250 characters').default(''),
      geojson: yup.array().min(1, 'A geometry is required').required('A geometry is required')
    })
  )
});

export const SurveyBlocksInitialValues = {
  name: '',
  description: ''
};

interface ISurveyLocationsListProps {
  checkboxSelectedIds: number[];
  handleCheckboxChange: (index: number[]) => void;
  handleDelete: (index: number) => void;
}

export const SurveyBlocksList = (props: ISurveyLocationsListProps) => {
  const { handleDelete, handleCheckboxChange, checkboxSelectedIds } = props;

  const { values, setFieldValue } = useFormikContext<{ blocks: ISurveyBlock[] }>();

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
      const updatedBlocks = values.blocks.map((block, index) =>
        index === currentItemIndex ? { ...block, ...formValues } : block
      );
      setFieldValue('blocks', updatedBlocks);
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
          dialogTitle={'Edit Block Details'}
          open={isEditOpen}
          dialogLoading={false}
          component={{
            element: <SurveyBlocksForm />,
            initialValues: values.blocks[currentItemIndex] ?? SurveyBlocksInitialValues,
            validationSchema: SurveyBlocksYupSchema
          }}
          dialogSaveButtonLabel="Save"
          onCancel={closeEditDialog}
          onSave={handleEditSave}
        />
      )}

      {/* Survey Blocks List */}
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
                checked={checkboxSelectedIds.length > 0 && checkboxSelectedIds.length === values.blocks.length}
                indeterminate={checkboxSelectedIds.length >= 1 && checkboxSelectedIds.length < values.blocks.length}
                onClick={() => {
                  if (checkboxSelectedIds.length === values.blocks.length) {
                    handleCheckboxChange([]);
                    return;
                  }
                  const locationIndices = values.blocks.map((_, index) => index);
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
            {values.blocks.map((item, index) => (
              <Collapse key={item.survey_block_id ?? item.uuid}>
                <SurveyLocationListItem
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
