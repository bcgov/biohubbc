import { mdiPencilOutline, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Collapse from '@mui/material/Collapse';
import { grey } from '@mui/material/colors';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
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
        <TransitionGroup>
          {data.map((item: ISurveyLocation, index: number) => {
            return (
              <Collapse key={`${item.name}-${item.description}`}>
                <Card
                  variant="outlined"
                  sx={{
                    mt: 1,
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
                    '& .MuiCardHeader-title': {
                      mb: 0.5
                    }
                  }}>
                  <CardHeader
                    title={item.name}
                    subheader={item.description}
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
                </Card>
              </Collapse>
            );
          })}
        </TransitionGroup>
      </Box>
    </>
  );
};
