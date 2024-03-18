import { Chip, ChipProps, Color } from '@mui/material';
import { blue, green, grey, purple } from '@mui/material/colors';
import { CodesContext } from 'contexts/codesContext';
import { useContext } from 'react';
import { getCodesName } from 'utils/Utils';

interface ISurveyProgressChipProps extends ChipProps {
  progress_id: number;
}

const SurveyProgressChip = (props: ISurveyProgressChipProps) => {
  const codesContext = useContext(CodesContext);

  const codeName = getCodesName(codesContext.codesDataLoader.data, 'survey_progress', props.progress_id || 0);

  const colorLookup: Record<string, Color> = {
    Planning: blue,
    'In progress': purple,
    Completed: green
  };

  // Providing a default color in case codeName is undefined
  const color = codeName ? colorLookup[codeName] : grey[200];

  return (
    <Chip
      title="Survey status"
      size="small"
      label={codeName}
      sx={{
        opacity: 0.8,
        backgroundColor: color[50],
        borderRadius: '5px',
        mx: '10px',
        minWidth: 0,
        '& .MuiChip-label': {
          color: color[800],
          fontWeight: 700,
          fontSize: '0.8rem'
        }
      }}
      {...props}
    />
  );
};

export default SurveyProgressChip;
