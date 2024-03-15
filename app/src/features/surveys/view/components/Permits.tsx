import Box from '@mui/material/Box';
import grey from '@mui/material/colors/grey';
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
    <>
      {permit.permits?.map((item, index) => {
        return (
          <Box component="dl" key={item.permit_id}>
            <Box className="row">
              <Typography component="dt">{`#${item.permit_number}`}</Typography>
              <Typography component="dd">{item.permit_type}</Typography>
            </Box>
          </Box>
        );
      })}
      {!permit.permits.length && (
        <Box
          pt={1}
          sx={{
            borderTop: '1px solid' + grey[200]
          }}>
          <Typography color="textSecondary">No permits found</Typography>
        </Box>
      )}
    </>
  );
};

export default Permits;
