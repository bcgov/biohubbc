import Box from '@mui/material/Box';
import { grey } from '@mui/material/colors';
import Paper from '@mui/material/Paper';
import Toolbar from '@mui/material/Toolbar';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useEffect } from 'react';
import ManualTelemetryTable from './ManualTelemetryTable';

const ManualTelemetryComponent = () => {
  const api = useTelemetryApi();
  useEffect(() => {
    const fetchData = async () => {
      const temp = await api.getManualTelemetry();
      console.log(temp);
    };
    fetchData();
  }, []);
  return (
    <>
      <Box
        display="flex"
        flexDirection="column"
        flex="1 1 auto"
        height="100%"
        sx={{
          overflow: 'hidden'
        }}>
        <Paper
          elevation={0}
          sx={{
            display: 'flex',
            flex: '1 1 auto',
            overflow: 'hidden',
            m: 1
          }}></Paper>
        <Toolbar></Toolbar>
        <Box
          display="flex"
          flexDirection="column"
          flex="1 1 auto"
          position="relative"
          sx={{
            background: grey[100]
          }}>
          <Box position="absolute" width="100%" height="100%" p={1}>
            <ManualTelemetryTable />
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default ManualTelemetryComponent;
