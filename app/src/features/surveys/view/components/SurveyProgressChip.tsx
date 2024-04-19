import { Chip, ChipProps, Color } from '@mui/material';
import { blue, green, grey, purple } from '@mui/material/colors';
import { useCodesContext } from 'hooks/useContext';
import { getCodesName } from 'utils/Utils';

interface ISurveyProgressChipProps extends ChipProps {
  progress_id: number;
}

const SurveyProgressChip = (props: ISurveyProgressChipProps) => {
  const codesContext = useCodesContext();

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
      {...props}
      sx={{
        opacity: 0.8,
        backgroundColor: color[50],
        borderRadius: '5px',
        minWidth: 0,
        '& .MuiChip-label': {
          color: color[900],
          fontWeight: 700,
          fontSize: '0.8rem'
        },
        ...props?.sx
      }}
    />
  );
};

export default SurveyProgressChip;
