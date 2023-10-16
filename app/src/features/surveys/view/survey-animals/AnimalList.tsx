import { Button, Toolbar, Typography } from "@mui/material"
import Icon from '@mdi/react';
import { Box } from "@mui/system"
import React from "react"
import { mdiPlus } from "@mdi/js";
import { Link as RouterLink } from 'react-router-dom';

const AnimalList = () => {
  return (
    <Box display="flex" flexDirection="column" height="100%">
      <Toolbar
        sx={{
          flex: '0 0 auto',
          borderBottom: '1px solid #ccc'
        }}>
        <Typography
          sx={{
            flexGrow: '1',
            fontSize: '1.125rem',
            fontWeight: 700
          }}>
          Animals
          </Typography>
        <Button
          sx={{
            mr: -1
          }}
          variant="contained"
          color="primary"
          component={RouterLink}
          to={'sampling'}
          startIcon={<Icon path={mdiPlus} size={1} />}>
          Add
          </Button>
      </Toolbar>
      <Box display="flex" flex="1 1 auto" height="100%" alignItems="center" justifyContent="center">
        <Typography variant="body2">No Animals</Typography>
      </Box>

    </Box>
  )
}

export default AnimalList
