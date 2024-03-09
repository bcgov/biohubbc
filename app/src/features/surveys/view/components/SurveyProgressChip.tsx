import { Chip, ChipProps } from '@mui/material';
import { grey } from '@mui/material/colors';
import { CodesContext } from 'contexts/codesContext';
import { useContext } from 'react';

interface ISurveyProgressChipProps extends ChipProps {
  progress_id: number;
}

const SurveyProgressChip = (props: ISurveyProgressChipProps) => {
  const codesContext = useContext(CodesContext);
  const codes = codesContext.codesDataLoader.data;

  const codeName = codes?.survey_progress.find((code) => code.id === props.progress_id)?.name;

  const colorLookup: Record<string, string> = {
    Planning: '#4d96a3',
    'In progress': '#e35f30',
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
          mt: '1px',
          letterSpacing: '0.03rem',
          color: '#fff',
        }
      }}
      {...props}
    />
  );
};

export default SurveyProgressChip;
