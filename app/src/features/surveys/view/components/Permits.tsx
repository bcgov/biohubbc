import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { CodesContext } from 'contexts/codesContext';
import { SurveyContext } from 'contexts/surveyContext';
import { useContext } from 'react';

/**
 * Permit content for a survey.
 *
 * @return {*}
 */
const Permits = () => {
  const codesContext = useContext(CodesContext);
  const surveyContext = useContext(SurveyContext);
  const surveyForViewData = surveyContext.surveyDataLoader.data;

  if (!surveyForViewData || !codesContext.codesDataLoader.data) {
    return <></>;
  }

  const {
    surveyData: { permit }
  } = surveyForViewData;

  return (
    <Box component="dl">
      {permit.permits?.map((item) => {
        return (
          <Box className="row" key={item.permit_id}>
            <Typography component="dt">{`#${item.permit_number}`}</Typography>
            <Typography component="dd">{item.permit_type}</Typography>
          </Box>
        );
      })}
      {!permit.permits.length && (
        <Box>
          <Typography>No Permits</Typography>
        </Box>
      )}
    </Box>
  );
};

export default Permits;
