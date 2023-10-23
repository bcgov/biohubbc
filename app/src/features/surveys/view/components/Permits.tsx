import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { CodesContext } from 'contexts/codesContext';
import { SurveyContext } from 'contexts/surveyContext';
import { useContext } from 'react';

/**
 * General information content for a survey.
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
      {permit.permits?.map((item, index: number) => {
        return (
          <Box className="row" key={index}>
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
