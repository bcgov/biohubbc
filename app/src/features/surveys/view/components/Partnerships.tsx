import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import assert from 'assert';
import { CodesContext } from 'contexts/codesContext';
import { SurveyContext } from 'contexts/surveyContext';
import { useContext } from 'react';

/**
 * Partnerships content for a survey.
 *
 * @return {*}
 */
const Partnerships = () => {
  const codesContext = useContext(CodesContext);
  const surveyContext = useContext(SurveyContext);

  // Codes data must be loaded by a parent before this component is rendered
  assert(codesContext.codesDataLoader.data);
  // Project data must be loaded by a parent before this component is rendered
  assert(surveyContext.surveyDataLoader.data);

  const codes = codesContext.codesDataLoader.data;
  const surveyData = surveyContext.surveyDataLoader.data.surveyData;

  const hasIndigenousPartnerships = Boolean(surveyData.partnerships.indigenous_partnerships?.length);
  const hasStakeholderPartnerships = Boolean(surveyData.partnerships.stakeholder_partnerships?.length);

  return (
    <Box component="dl">
      <Box className="row">
        <Typography component="dt">Indigenous Partnerships</Typography>
        {surveyData.partnerships.indigenous_partnerships?.map((indigenousPartnership: number) => {
          return (
            <Typography component="dd" key={`first-nations-${indigenousPartnership}`}>
              {codes.first_nations?.find((item: any) => item.id === indigenousPartnership)?.name}
            </Typography>
          );
        })}
        {!hasIndigenousPartnerships && <Typography component="dd">None</Typography>}
      </Box>

      <Box className="row">
        <Typography component="dt">Other Partnerships</Typography>
        {surveyData.partnerships.stakeholder_partnerships?.map((stakeholderPartnership: string) => {
          return (
            <Typography component="dd" key={`stakeholder-${stakeholderPartnership}`}>
              {stakeholderPartnership}
            </Typography>
          );
        })}

        {!hasStakeholderPartnerships && <Typography component="dd">None</Typography>}
      </Box>
    </Box>
  );
};

export default Partnerships;
