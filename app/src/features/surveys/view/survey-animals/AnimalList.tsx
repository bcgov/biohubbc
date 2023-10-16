import { Button, Toolbar, Typography } from "@mui/material"
import Icon from '@mdi/react';
import { Box } from "@mui/system"
import React, { useContext } from "react"
import { mdiPlus } from "@mdi/js";
import { Link as RouterLink } from 'react-router-dom';
import { useBiohubApi } from "hooks/useBioHubApi";
import useDataLoader from "hooks/useDataLoader";
import { SurveyContext } from "contexts/surveyContext";

const AnimalList = () => {
  const bhApi = useBiohubApi();
  const surveyContext = useContext(SurveyContext);

  const {
    //refresh: refreshCritters,
    load: loadCritters,
    data: critterData
  } = useDataLoader(() => bhApi.survey.getSurveyCritters(surveyContext.projectId, surveyContext.surveyId));

  if (!critterData) {
    loadCritters();
  }

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
      {/*temp critter data*/}
      {critterData?.map(critter => <div>{critter.animal_id}</div>)}
      <Box display="flex" flex="1 1 auto" height="100%" alignItems="center" justifyContent="center">
        <Typography variant="body2">No Animals</Typography>
      </Box>

    </Box>
  )
}

export default AnimalList
