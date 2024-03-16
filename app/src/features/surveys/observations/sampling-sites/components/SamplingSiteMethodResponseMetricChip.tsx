import { grey } from '@mui/material/colors';
import ColouredRectangleChip from 'components/chips/ColouredRectangleChip';
import { CodesContext } from 'contexts/codesContext';
import { useContext, useEffect } from 'react';
import { getCodesName } from 'utils/Utils';

interface ISamplingSiteMethodResponseMetricChipProps {
  method_response_metric_id: number;
  strong?: boolean;
  inverse?: boolean;
}

const SamplingSiteMethodResponseMetricChip = (props: ISamplingSiteMethodResponseMetricChipProps) => {
  const codesContext = useContext(CodesContext);

  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, [codesContext.codesDataLoader]);

  return (
    <ColouredRectangleChip
      {...props} // Pass other props from ISamplingSiteMethodResponseMetricChipProps
      colour={grey}
      sx={{ mx: 1 }}
      label={
        getCodesName(
          codesContext.codesDataLoader.data,
          'method_response_metrics',
          props.method_response_metric_id || 0
        ) ?? ''
      }
      title="Method response metric"
    />
  );
};

export default SamplingSiteMethodResponseMetricChip;
