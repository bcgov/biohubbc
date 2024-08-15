import { ChipProps } from '@mui/material';
import ColouredRectangleChip from 'components/chips/ColouredRectangleChip';
import { getSurveyProgressColour, SurveyProgressKeys } from 'constants/colours';
import { useCodesContext } from 'hooks/useContext';
import { useEffect } from 'react';
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

  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, [codesContext.codesDataLoader]);

  const codeName = getCodesName(codesContext.codesDataLoader.data, 'survey_progress', props.progress_id) ?? '';

  return (
    <ColouredRectangleChip
      colour={getSurveyProgressColour(codeName as SurveyProgressKeys)}
      label={codeName}
      title="Survey progress"
    />
  );
};
