import { mdiPencilOutline, mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { ListItemIcon, Menu, MenuItem, MenuProps } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import { useFormikContext } from 'formik';
import { ICreateSurveyRequest } from 'interfaces/useSurveyApi.interface';
import React, { useState } from 'react';
import yup from 'utils/YupSchema';
import CreateSurveyBlockDialog from './CreateSurveyBlockDialog';
import EditSurveyBlockDialog from './EditSurveyBlockDialog';

interface ISurveyBlockFormProps {
  name: string; // the name of the formik field value
}

export const SurveyBlockInitialValues = {
  blocks: []
};

// Form validation for Block Item
export const BlockYupSchema = yup.object({
  name: yup.string().required(),
  description: yup.string().required()
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

const SurveyBlockSection: React.FC<ISurveyBlockFormProps> = (props) => {
  const { name } = props;
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<MenuProps['anchorEl']>(null);
  const [editData, setEditData] = useState<IEditBlock | undefined>(undefined);

  const formikProps = useFormikContext<ICreateSurveyRequest>();
  const { values, handleSubmit, setFieldValue } = formikProps;

  const handleMenuClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, index: number) => {
    setAnchorEl(event.currentTarget);
    setEditData({ index: index, block: values.blocks[index] });
  };

  const handleDelete = () => {
    if (editData) {
      const data = values.blocks;
      data.splice(editData.index, 1);
      setFieldValue(name, data);
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
          setFieldValue(`${name}[${values.blocks.length}]`, data);
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
          setEditData(undefined);
          setFieldValue(`${name}[${index}]`, data);
          setIsEditModalOpen(false);
          setAnchorEl(null);
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
      <form onSubmit={handleSubmit}>
        <Button
          data-testid="block-form-add-button"
          sx={{ marginBottom: 1 }}
          variant="outlined"
          color="primary"
          title="Add Block"
          aria-label="Add Block"
          startIcon={<Icon path={mdiPlus} size={1} />}
          onClick={() => setIsCreateModalOpen(true)}>
          Add Block
        </Button>
        <Box>
          {values.blocks.map((item, index) => {
            return (
              <Card key={`${item.name}-${item.description}`} sx={{ marginTop: 1 }}>
                <CardHeader
                  action={
                    <IconButton aria-label="settings">
                      <MoreVertIcon />
                    </IconButton>
                  }
                  onClick={(event: React.MouseEvent<HTMLDivElement, MouseEvent>) => handleMenuClick(event, index)}
                  title={item.name}
                  subheader={item.description}
                />
              </Card>
            );
          })}
        </Box>
      </form>
    </>
  );
};

export default SurveyBlockSection;
