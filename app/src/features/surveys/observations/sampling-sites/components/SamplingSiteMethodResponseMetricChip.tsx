import { Chip } from '@mui/material';
import { blue, deepOrange, purple, teal } from '@mui/material/colors';
import { CodesContext } from 'contexts/codesContext';
import { useContext, useEffect } from 'react';
import { getCodesName } from 'utils/Utils';

interface ISamplingSiteMethodResponseMetricChipProps {
  method_response_metric_id: number;
}

const SamplingSiteMethodResponseMetricChip = (props: ISamplingSiteMethodResponseMetricChipProps) => {
  const codesContext = useContext(CodesContext);

  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, [codesContext.codesDataLoader]);

  const chipColours = [purple[400], deepOrange[600], blue[600], teal[400]];

  console.log(props.method_response_metric_id);

  return (
    <Chip
      size="small"
      label={getCodesName(
        codesContext.codesDataLoader.data,
        'method_response_metrics',
        props.method_response_metric_id || 0
      )}
      title="Response metric"
      sx={{
        opacity: 0.7,
        fontSize: '0.75rem',
        mx: 2,
        minWidth: 0,
        borderRadius: '5px',
        color: '#fff',
        backgroundColor: chipColours[props.method_response_metric_id - 1],
        fontWeight: 700
      }}
    />
  );
};

export default SamplingSiteMethodResponseMetricChip;
