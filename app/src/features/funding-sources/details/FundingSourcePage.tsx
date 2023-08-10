import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import ComponentDialog from 'components/dialog/ComponentDialog';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import FundingSourceDetails from './FundingSourceDetails';
import FundingSourceSurveyReferences from './FundingSourceSurveyReferences';

export interface IFundingSourceDetailsProps {
  fundingSourceId?: number;
  open: boolean;
  onClose: () => void;
}

const FundingSourcePage = (props: IFundingSourceDetailsProps) => {
  const biohubApi = useBiohubApi();

  const fundingSourceDataLoader = useDataLoader((fundingSourceId: number) =>
    biohubApi.funding.getFundingSource(fundingSourceId)
  );

  if (!props.fundingSourceId) {
    return null;
  }

  fundingSourceDataLoader.load(props.fundingSourceId);

  if (!fundingSourceDataLoader.isReady) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  if (!fundingSourceDataLoader.data) {
    return null;
  }

  return (
    <ComponentDialog open={props.open} dialogTitle={fundingSourceDataLoader.data.name} onClose={props.onClose}>
      <Box>
        <FundingSourceDetails fundingSource={fundingSourceDataLoader.data} />
      </Box>
      <Box>
        <FundingSourceSurveyReferences fundingSourceSurveyReferences={[]} />
      </Box>
    </ComponentDialog>
  );
};

export default FundingSourcePage;
