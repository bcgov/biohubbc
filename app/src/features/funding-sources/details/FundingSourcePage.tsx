import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import ComponentDialog from 'components/dialog/ComponentDialog';
import { FundingSourceI18N } from 'constants/i18n';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import useDataLoaderError from 'hooks/useDataLoaderError';
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

  useDataLoaderError(fundingSourceDataLoader, (dataLoader) => {
    return {
      dialogTitle: FundingSourceI18N.fetchFundingSourceErrorTitle,
      dialogText: FundingSourceI18N.fetchFundingSourceErrorText,
      dialogError: (dataLoader.error as APIError).message,
      dialogErrorDetails: (dataLoader.error as APIError).errors
    };
  });

  if (!props.fundingSourceId) {
    return null;
  }

  fundingSourceDataLoader.load(props.fundingSourceId);

  if (!fundingSourceDataLoader.isReady || !fundingSourceDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <ComponentDialog
      open={props.open}
      closeButtonLabel="Close"
      dialogTitle={fundingSourceDataLoader.data.funding_source.name}
      onClose={props.onClose}>
      <Box mb={3}>
        <FundingSourceDetails fundingSource={fundingSourceDataLoader.data.funding_source} />
      </Box>
      <Divider></Divider>
      <Box mt={3}>
        <FundingSourceSurveyReferences
          fundingSourceSurveyReferences={fundingSourceDataLoader.data.funding_source_survey_references}
        />
      </Box>
    </ComponentDialog>
  );
};

export default FundingSourcePage;
