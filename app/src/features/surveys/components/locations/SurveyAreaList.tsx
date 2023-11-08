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
import { useState } from 'react';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import { ISurveyLocation } from '../StudyAreaForm';

export interface ISurveyAreaListProps {
  data: ISurveyLocation[];
  openEdit: (index: number) => void;
  openDelete: (index: number) => void;
}

export const SurveyAreaList = (props: ISurveyAreaListProps) => {
  const { data, openEdit, openDelete } = props;
  const [anchorEl, setAnchorEl] = useState<MenuProps['anchorEl']>(null);
  const [currentItemIndex, setCurrentItemIndex] = useState<number | null>(-1);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, index: number) => {
    setAnchorEl(event.currentTarget);
    setCurrentItemIndex(index);
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
        <MenuItem
          onClick={() => {
            if (currentItemIndex != null) {
              openEdit(currentItemIndex);
            }
            setAnchorEl(null);
          }}>
          <ListItemIcon>
            <Icon path={mdiPencilOutline} size={1} />
          </ListItemIcon>
          Edit Details
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (currentItemIndex != null) {
              openDelete(currentItemIndex);
            }
            setAnchorEl(null);
          }}>
          <ListItemIcon>
            <Icon path={mdiTrashCanOutline} size={1} />
          </ListItemIcon>
          Remove
        </MenuItem>
      </Menu>
      <Box data-testid="study-area-list" display="flex" flexDirection="column" height="100%">
        <List component={TransitionGroup} disablePadding>
          {data.map((item: ISurveyLocation, index: number) => {
            return (
              <Collapse
                key={`${item.name}-${item.description}`}
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
                  sx={{
                    py: 1.5,
                    pl: 3,
                    minHeight: '55px'
                  }}>
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
