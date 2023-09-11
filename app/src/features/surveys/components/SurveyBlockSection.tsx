import { mdiPencilOutline, mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { ListItemIcon, Menu, MenuItem, MenuProps, Typography } from '@mui/material';
// import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import { useFormikContext } from 'formik';
import { ICreateSurveyRequest } from 'interfaces/useSurveyApi.interface';
import React, { useState } from 'react';
import { TransitionGroup } from 'react-transition-group';
import yup from 'utils/YupSchema';
import CreateSurveyBlockDialog from './CreateSurveyBlockDialog';
import EditSurveyBlockDialog from './EditSurveyBlockDialog';

export const SurveyBlockInitialValues = {
  blocks: []
};

// Form validation for Block Item
export const BlockYupSchema = yup.object({
  name: yup.string().required('Name is required').max(50, 'Maximum 50 characters'),
  description: yup.string().required('Description is required').max(250, 'Maximum 250 characters')
});

export const SurveyBlockYupSchema = yup.array(BlockYupSchema);

export interface IEditBlock {
  index: number;
  block: {
    survey_block_id: number | null;
    name: string;
    description: string;
  };
}

const SurveyBlockSection: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<MenuProps['anchorEl']>(null);
  const [editData, setEditData] = useState<IEditBlock | undefined>(undefined);

  const formikProps = useFormikContext<ICreateSurveyRequest>();
  const { values, handleSubmit, setFieldValue } = formikProps;

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, index: number) => {
    setAnchorEl(event.currentTarget);
    setEditData({ index: index, block: values.blocks[index] });
  };

  const handleDelete = () => {
    if (editData) {
      const data = values.blocks;
      data.splice(editData.index, 1);
      setFieldValue('blocks', data);
    }
    setAnchorEl(null);
  };

  return (
    <>
      {/* CREATE BLOCK DIALOG */}
      <CreateSurveyBlockDialog
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={(data) => {
          setEditData(undefined);
          setFieldValue(`blocks[${values.blocks.length}]`, data);
          setIsCreateModalOpen(false);
        }}
      />

      {/* EDIT BLOCK DIALOG */}
      <EditSurveyBlockDialog
        open={isEditModalOpen}
        initialData={editData}
        onClose={() => {
          setIsEditModalOpen(false);
          setAnchorEl(null);
        }}
        onSave={(data, index) => {
          setIsEditModalOpen(false);
          setAnchorEl(null);
          setEditData(undefined);
          setFieldValue(`blocks[${index}]`, data);
        }}
      />
      <Typography
        variant="h5"
        component="h3"
        sx={{
          marginBottom: '14px'
        }}>
        Define Blocks{' '}
        <Typography component="span" color="textSecondary" fontWeight="inherit">
          (optional)
        </Typography>
      </Typography>
      <Typography
        variant="body1"
        color="textSecondary"
        sx={{
          mb: 2,
          maxWidth: '90ch'
        }}>
        Enter a name and description for each block used in this survey.
      </Typography>
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
      <form onSubmit={handleSubmit}>
        <TransitionGroup>
          {values.blocks.map((item, index) => {
            return (
              <Collapse key={`${item.name}-${item.description}-${index}`}>
                <Card
                  variant="outlined"
                  sx={{
                    mt: 1,
                    '& .MuiCardHeader-title': {
                      mb: 0.5
                    }
                  }}>
                  <CardHeader
                    action={
                      <IconButton
                        onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) =>
                          handleMenuClick(event, index)
                        }
                        aria-label="settings">
                        <MoreVertIcon />
                      </IconButton>
                    }
                    title={item.name}
                    subheader={item.description}
                  />
                </Card>
              </Collapse>
            );
          })}
        </TransitionGroup>
        <Button
          sx={{
            mt: 1
          }}
          data-testid="block-form-add-button"
          variant="outlined"
          color="primary"
          title="Add Block"
          aria-label="Add Block"
          startIcon={<Icon path={mdiPlus} size={1} />}
          onClick={() => setIsCreateModalOpen(true)}>
          Add Block
        </Button>
      </form>
    </>
  );
};

export default SurveyBlockSection;
