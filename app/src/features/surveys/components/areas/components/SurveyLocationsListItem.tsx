import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Checkbox, IconButton, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import React from 'react';
import { ISurveyBlock } from '../blocks/form/SurveyBlocksForm';
import { ISurveyLocation } from '../locations/form/SurveyLocationsForm';

interface ISurveyLocationListItemProps {
  item: ISurveyLocation | ISurveyBlock;
  index: number;
  onMenuClick: (event: React.MouseEvent<HTMLButtonElement>, index: number) => void;
  checked: boolean;
  onCheckboxClick: (index: number) => void;
}

const SurveyLocationListItem = (props: ISurveyLocationListItemProps) => {
  const { item, index, onMenuClick, checked, onCheckboxClick } = props;
  return (
    <ListItem
      component="div"
      secondaryAction={
        <IconButton onClick={(event) => onMenuClick(event, index)} aria-label="settings">
          <MoreVertIcon />
        </IconButton>
      }
      sx={{ minHeight: '55px', pl: 3, alignItems: 'flex-start' }}>
      <ListItemIcon sx={{ minWidth: 35 }}>
        <Checkbox
          edge="start"
          checked={checked}
          onClick={() => onCheckboxClick(index)}
          inputProps={{ 'aria-label': 'controlled' }}
        />
      </ListItemIcon>
      <ListItemText
        sx={{
          mt: 1,
          '& .MuiListItemText-primary': {
            fontWeight: 700,
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
  );
};

export default SurveyLocationListItem;
