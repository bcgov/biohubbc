import { Chip } from '@mui/material';
import { grey } from '@mui/material/colors';
import { CodesContext } from 'contexts/codesContext';
import { IGetSurveyForViewResponse } from 'interfaces/useSurveyApi.interface';
import { useContext } from 'react';

interface ISurveyProgressChipProps {
  surveyWithDetails: IGetSurveyForViewResponse;
}

const SurveyProgressChip = (props: ISurveyProgressChipProps) => {
  const codesContext = useContext(CodesContext);
  const codes = codesContext.codesDataLoader.data;

  const codeName = codes?.survey_progress.find(
    (code) => code.id === props.surveyWithDetails.surveyData.survey_details.progress_id
  )?.name;

  const colorLookup: Record<string, string> = {
    Planning: '#109ec2',
    'In progress': '#db5b00',
    Completed: '#099c30'
  };

  // Providing a default color in case codeName is undefined
  const color = codeName ? colorLookup[codeName] : grey[200];

  return (
    <Chip
      title="Survey status"
      label={<>{codeName}</>}
      sx={{
        backgroundColor: color,
        ml: '5px',
        '& .MuiChip-label': {
          fontWeight: 600,
          mt: '1px',
          letterSpacing: '0.03rem',
          color: '#fff'
        }
      }}
    />
  );
};

export default SurveyProgressChip;
