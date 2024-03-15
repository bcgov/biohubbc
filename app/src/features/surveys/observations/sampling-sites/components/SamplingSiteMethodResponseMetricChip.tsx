import { Chip } from '@mui/material';
import { grey } from '@mui/material/colors';
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
        opacity: 0.8,
        backgroundColor: grey[50],
        borderRadius: '5px',
        mx: '10px',
        minWidth: 0,
        '& .MuiChip-label': {
          color: grey[700],
          fontWeight: 700,
          fontSize: '0.75rem'
        }
      }}
    />
  );
};

export default SamplingSiteMethodResponseMetricChip;
