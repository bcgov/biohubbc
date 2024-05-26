import { ChipProps } from '@mui/material';
import grey from '@mui/material/colors/grey';
import ColouredRectangleChip from 'components/chips/ColouredRectangleChip';
import { SurveyProgressChipColours } from 'constants/misc';
import { useCodesContext } from 'hooks/useContext';
import { getCodesName } from 'utils/Utils';

interface ISurveyProgressChipProps extends ChipProps {
  progress_id: number;
}

/**
 * Returns stylized ColouredRectangleChip for displaying Survey progress
 *
 * @param props
 * @returns
 */
const SurveyProgressChip = (props: ISurveyProgressChipProps) => {
  const codesContext = useCodesContext();

  const codeName = getCodesName(codesContext.codesDataLoader.data, 'survey_progress', props.progress_id) ?? '';
  const codeColour = SurveyProgressChipColours.find((option) => option.label === codeName)?.colour ?? grey;

  return <ColouredRectangleChip colour={codeColour} label={codeName} title="Survey progress" />;
};

export default SurveyProgressChip;
