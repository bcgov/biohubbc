import { ChipProps } from '@mui/material';
import ColouredRectangleChip from 'components/chips/ColouredRectangleChip';
import { getSurveyProgressColour } from 'constants/colours';
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
export const SurveyProgressChip = (props: ISurveyProgressChipProps) => {
  const codesContext = useCodesContext();

  const codeName = getCodesName(codesContext.codesDataLoader.data, 'survey_progress', props.progress_id) ?? '';

  return <ColouredRectangleChip colour={getSurveyProgressColour(codeName)} label={codeName} title="Survey progress" />;
};
