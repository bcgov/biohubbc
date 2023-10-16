import { mdiPencilOutline, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import { grey } from '@mui/material/colors';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu, { MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { ISurveyLocation } from '../StudyAreaForm';

export interface ISurveyAreaListProps {
  title: string;
  isLoading: boolean;
  data: ISurveyLocation[];
  openEdit: (index: number) => void;
  openDelete: () => void;
}

export const SurveyAreaList = (props: ISurveyAreaListProps) => {
  const { title, data, openEdit } = props;
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
            console.log('DELETE LOCATION');
            setAnchorEl(null);
          }}>
          <ListItemIcon>
            <Icon path={mdiTrashCanOutline} size={1} />
          </ListItemIcon>
          Remove
        </MenuItem>
      </Menu>
      <Box display="flex" flexDirection="column" height="100%">
        <Toolbar
          sx={{
            flex: '0 0 auto',
            borderBottom: '1px solid #ccc'
          }}>
          <Typography
            sx={{
              flexGrow: '1'
            }}>
            <strong>{title}</strong>
          </Typography>
        </Toolbar>
        <Box
          position="relative"
          display="flex"
          flexDirection="column"
          flex="1 1 auto"
          p={1}
          sx={{
            overflowY: 'scroll',
            background: grey[50],
            '& .MuiAccordion-root + .MuiAccordion-root': {
              borderTopStyle: 'solid',
              borderTopWidth: '1px',
              borderTopColor: grey[300]
            }
          }}>
          {data.map((item: ISurveyLocation, index: number) => {
            return (
              <Card key={`${item.name}-${item.description}-${index}`} sx={{ marginBottom: 1 }} variant="outlined">
                <CardHeader
                  title={item.name}
                  subheader={item.description}
                  action={
                    <IconButton
                      edge="end"
                      onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) =>
                        handleMenuClick(event, index)
                      }
                      aria-label="settings">
                      <MoreVertIcon />
                    </IconButton>
                  }
                />
              </Card>
            );
          })}
        </Box>
      </Box>
    </>
  );
};
