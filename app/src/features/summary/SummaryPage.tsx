import Container from '@mui/material/Container';
import PageHeader from 'components/layout/PageHeader';
import { SystemAlertBanner } from 'features/alert/banner/SystemAlertBanner';
import { ListDataTableContainer } from 'features/summary/list-data/ListDataTableContainer';
import { SystemAlertBannerEnum } from 'interfaces/useAlertApi.interface';

/**
 * Page to display a summary of a user's field data.
 *
 * @return {*}
 */
const SummaryPage = () => {
  return (
    <>
      <PageHeader title="Overview" />
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <SystemAlertBanner alertTypes={[SystemAlertBannerEnum.SUMMARY]} />
        <ListDataTableContainer />
      </Container>
    </>
  );
};

export default SummaryPage;
