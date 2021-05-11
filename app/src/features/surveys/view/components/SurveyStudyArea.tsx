import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { mdiPencilOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { IGetProjectSurveyForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';

export interface ISurveyStudyAreaProps {
  surveyForViewData: IGetProjectSurveyForViewResponse;
}

/**
 * Study area content for a survey.
 *
 * @return {*}
 */
const SurveyStudyArea: React.FC<ISurveyStudyAreaProps> = (props) => {
  const { survey } = props.surveyForViewData;

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2} height="2rem">
        <Typography variant="h3">Study Area</Typography>
        <Button
          variant="text"
          color="primary"
          className="sectionHeaderButton"
          onClick={() => {}}
          title="Edit Study Area"
          aria-label="Edit Study Area"
          startIcon={<Icon path={mdiPencilOutline} size={0.875} />}>
          Edit
        </Button>
      </Box>
      <dl>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <Typography component="dt" variant="subtitle2" color="textSecondary">
              Survey Area Name
            </Typography>
            <Typography component="dd" variant="body1">
              {survey.survey_area_name}
            </Typography>
          </Grid>
        </Grid>
      </dl>
    </Box>
  );
};

export default SurveyStudyArea;
