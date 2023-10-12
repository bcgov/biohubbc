import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import { grey } from '@mui/material/colors';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

export interface ISurveyAreaListProps {
  title: string;
  isLoading: boolean;
  data: any[];
}

export const SurveyAreaList = () => {
  return (
    <>
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
            <strong>Boundaries (3)</strong>
          </Typography>
          <Button
            sx={{
              mr: -1
            }}
            variant="outlined"
            color="primary"
            startIcon={<Icon path={mdiPlus} size={1} />}
            onClick={() => console.log('Open Import Component')}>
            Import
          </Button>
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
          <Card sx={{ marginBottom: 1 }} variant="outlined">
            <CardHeader
              title={'Card Header Title'}
              subheader={'Card Header Description'}
              action={
                <IconButton onClick={() => console.log('Open Context Menu')}>
                  <MoreVertIcon />
                </IconButton>
              }
            />
          </Card>

          <Card sx={{ marginBottom: 1 }} variant="outlined">
            <CardHeader
              title={'Card Header Title'}
              subheader={'Card Header Description'}
              action={
                <IconButton onClick={() => console.log('Open Context Menu')}>
                  <MoreVertIcon />
                </IconButton>
              }
            />
          </Card>

          <Card sx={{ marginBottom: 1 }} variant="outlined">
            <CardHeader
              title={'Card Header Title'}
              subheader={'Card Header Description'}
              action={
                <IconButton onClick={() => console.log('Open Context Menu')}>
                  <MoreVertIcon />
                </IconButton>
              }
            />
          </Card>
        </Box>
      </Box>
    </>
  );
};
