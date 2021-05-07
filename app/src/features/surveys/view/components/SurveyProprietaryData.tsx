import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { mdiPencilOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { IGetProjectSurveyForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';

export interface ISurveyProprietaryDataProps {
  surveyForViewData: IGetProjectSurveyForViewResponse;
}

/**
 * Proprietary data content for a survey.
 *
 * @return {*}
 */
const SurveyProprietaryData: React.FC<ISurveyProprietaryDataProps> = (props) => {
  const { surveyProprietor } = props.surveyForViewData;

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2} height="2rem">
        <Typography variant="h3">Proprietary Data</Typography>
        <Button
          variant="text"
          color="primary"
          className="sectionHeaderButton"
          onClick={() => {}}
          title="Edit Proprietary Data"
          aria-label="Edit Proprietary Data"
          startIcon={<Icon path={mdiPencilOutline} size={0.875} />}>
          Edit
        </Button>
      </Box>
      <dl>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <Typography component="dt" variant="subtitle2" color="textSecondary">
              Data Sharing Agreement Required
            </Typography>
            <Typography component="dd" variant="body1">
              {surveyProprietor.data_sharing_agreement_required === 'true' ? 'Yes' : 'No'}
            </Typography>
          </Grid>
          {surveyProprietor.proprietor_type_name && (
            <>
              <Grid item xs={12} sm={6} md={4}>
                <Typography component="dt" variant="subtitle2" color="textSecondary">
                  Proprietary Data Category
                </Typography>
                <Typography component="dd" variant="body1">
                  {surveyProprietor.proprietor_type_name}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography component="dt" variant="subtitle2" color="textSecondary">
                  Proprietor Name
                </Typography>
                <Typography component="dd" variant="body1">
                  {surveyProprietor.proprietor_name}
                </Typography>
              </Grid>
              <Grid item>
                <Box mt={1}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" height="2rem">
                    <Typography component="dt" variant="subtitle2" color="textSecondary">
                      Category Rational
                    </Typography>
                  </Box>
                  <Typography style={{ wordBreak: 'break-all' }}>{surveyProprietor.category_rational}</Typography>
                </Box>
              </Grid>
            </>
          )}
        </Grid>
        {!surveyProprietor.proprietor_type_name && (
          <Grid container spacing={2}>
            <Grid item>
              <Box mt={1}>
                <Box display="flex" alignItems="center" justifyContent="space-between" height="2rem">
                  <Typography component="dt" variant="subtitle2" color="textSecondary">
                    Proprietary Information
                  </Typography>
                </Box>
                <Typography>The data captured in this survey is not proprietary.</Typography>
              </Box>
            </Grid>
          </Grid>
        )}
      </dl>
    </Box>
  );
};

export default SurveyProprietaryData;
