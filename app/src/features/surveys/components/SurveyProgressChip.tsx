import { ChipProps } from '@mui/material';
import { blueGrey } from '@mui/material/colors';
import ColouredRectangleChip from 'components/chips/ColouredRectangleChip';
import { SurveyProgressChipColours } from 'constants/misc';
import { useCodesContext } from 'hooks/useContext';
import { getCodesName } from 'utils/Utils';

interface ISurveyProgressChipProps extends ChipProps {
  progress_id: number;
}

/**
 * Returns stylized ColouredRectangleChip for displaying Survey progress
 * @param props
 * @returns
 */
const SurveyProgressChip = (props: ISurveyProgressChipProps) => {
  const codesContext = useCodesContext();

  const codeName =
    getCodesName(codesContext.codesDataLoader.data, 'survey_progress', props.progress_id)?.toUpperCase() ?? '';
  const codeColour = SurveyProgressChipColours[codeName] ?? blueGrey;

  return <ColouredRectangleChip colour={codeColour} label={codeName} title="Survey progress" />;
};

export default SurveyProgressChip;
