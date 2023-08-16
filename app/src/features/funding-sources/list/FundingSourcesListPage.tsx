import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import { Theme } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';
import { FundingSourceI18N } from 'constants/i18n';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import useDataLoaderError from 'hooks/useDataLoaderError';
import React, { useState } from 'react';
import CreateFundingSource from '../components/CreateFundingSource';
import DeleteFundingSource from '../components/DeleteFundingSource';
import EditFundingSource from '../components/EditFundingSource';
import FundingSourcePage from '../details/FundingSourcePage';
import FundingSourcesTable from './FundingSourcesTable';

const useStyles = makeStyles((theme: Theme) => ({
  pageTitleContainer: {
    maxWidth: '170ch',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  pageTitle: {
    display: '-webkit-box',
    '-webkit-line-clamp': 2,
    '-webkit-box-orient': 'vertical',
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(0.5),
    overflow: 'hidden'
  },
  pageTitleActions: {
    paddingTop: theme.spacing(0.75),
    paddingBottom: theme.spacing(0.75)
  },
  toolbarCount: {
    fontWeight: 400
  }
}));

/**
 * Page to display a list of funding sources.
 *
 * @return {*}
 */
const FundingSourcesListPage: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [fundingSourceId, setFundingSourceId] = useState<number | null>();

  const classes = useStyles();
  const biohubApi = useBiohubApi();

  const fundingSourceDataLoader = useDataLoader(() => biohubApi.funding.getAllFundingSources());

  useDataLoaderError(fundingSourceDataLoader, (dataLoader) => {
    return {
      dialogTitle: FundingSourceI18N.fetchFundingSourcesErrorTitle,
      dialogText: FundingSourceI18N.fetchFundingSourcesErrorText,
      dialogError: (dataLoader.error as APIError).message,
      dialogErrorDetails: (dataLoader.error as APIError).errors
    };
  });

  fundingSourceDataLoader.load();

  const closeModal = (refresh?: boolean) => {
    if (refresh) {
      fundingSourceDataLoader.refresh();
    }
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setIsViewModalOpen(false);
    setFundingSourceId(null);
  };

  const openViewModal = (fundingSourceId: number) => {
    setFundingSourceId(fundingSourceId);
    setIsViewModalOpen(true);
  };

  if (!fundingSourceDataLoader.isReady) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <>
      {/* CREATE FUNDING SOURCE MODAL */}
      <CreateFundingSource open={isCreateModalOpen} onClose={closeModal} />
      {/* VIEW FUNDING SOURCE MODAL */}
      {fundingSourceId && isViewModalOpen && (
        <FundingSourcePage
          fundingSourceId={fundingSourceId}
          open={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
        />
      )}
      {/* EDIT FUNDING SOURCE MODAL */}
      {fundingSourceId && isEditModalOpen && (
        <EditFundingSource fundingSourceId={fundingSourceId} open={isEditModalOpen} onClose={closeModal} />
      )}
      {/* DELETE FUNDING SOURCE MODAL */}
      {fundingSourceId && isDeleteModalOpen && (
        <DeleteFundingSource
          fundingSourceId={fundingSourceId}
          open={isDeleteModalOpen}
          onClose={closeModal}
          openViewModal={openViewModal}
        />
      )}
      <Paper square={true} elevation={0}>
        <Container maxWidth="xl">
          <Box py={4}>
            <Box display="flex" justifyContent="space-between">
              <Box className={classes.pageTitleContainer}>
                <Typography variant="h1" className={classes.pageTitle}>
                  Funding Sources
                </Typography>
              </Box>
              <Box flex="0 0 auto" className={classes.pageTitleActions}>
                <Button
                  variant="contained"
                  color="primary"
                  aria-label="Create Funding Source"
                  startIcon={<Icon path={mdiPlus} size={1} />}
                  onClick={() => setIsCreateModalOpen(true)}
                  data-testid="funding-source-list-create-button">
                  Create Funding Source
                </Button>
              </Box>
            </Box>
          </Box>
        </Container>
      </Paper>
      <Container maxWidth="xl">
        <Box py={3}>
          <Paper elevation={0}>
            <Toolbar style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h4" component="h2" data-testid="funding-source-list-found">
                Records Found &zwnj;
                <Typography className={classes.toolbarCount} component="span" variant="inherit" color="textSecondary">
                  ({fundingSourceDataLoader.data?.length || 0})
                </Typography>
              </Typography>
            </Toolbar>
            <Divider></Divider>
            <Box pt={0} pb={1} px={3}>
              <FundingSourcesTable
                fundingSources={fundingSourceDataLoader.data ?? []}
                onView={(fundingSourceId) => {
                  openViewModal(fundingSourceId);
                }}
                onEdit={(fundingSourceId) => {
                  setFundingSourceId(fundingSourceId);
                  setIsEditModalOpen(true);
                }}
                onDelete={(fundingSourceId) => {
                  setFundingSourceId(fundingSourceId);
                  setIsDeleteModalOpen(true);
                }}
              />
            </Box>
          </Paper>
        </Box>
      </Container>
    </>
  );
};

export default FundingSourcesListPage;
