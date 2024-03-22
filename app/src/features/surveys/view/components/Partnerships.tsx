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

  return (
    <Box component="dl"
      sx={{
        '& dd span': {
          position: 'relative',
          display: 'inline-block',
          mr: 1.25,
          '&::after': {
            content: `','`,
            position: 'absolute',
            top: 0
          },
          '&:last-child::after': {
            display: 'none'
          }
        }
      }}
    >
      <Box className="row">
        <Typography component="dt">Indigenous Partnerships</Typography>
        <Typography component="dd">
          {surveyData.partnerships.indigenous_partnerships.length ? (
            surveyData.partnerships.indigenous_partnerships?.map((indigenousPartnership: number) => {
              return (
                <span key={`first-nations-${indigenousPartnership}`}>
                  {codes.first_nations?.find((item: any) => item.id === indigenousPartnership)?.name}
                </span>
              );
            })
          ) : (
            <span>None</span>
          )}
        </Typography>
      </Box>

      <Box className="row">
        <Typography component="dt">Other Partnerships</Typography>
        <Typography component="dd">
          {surveyData.partnerships.stakeholder_partnerships.length ? (
            surveyData.partnerships.stakeholder_partnerships?.map((stakeholderPartnership: string) => {
              return (
                <span key={`stakeholder-${stakeholderPartnership}`}>
                  {stakeholderPartnership}
                </span>
              );
            })
          ) : (
            <span>None</span>
          )}
        </Typography>
      </Box>
    </Box>
  );
};

export default Partnerships;
