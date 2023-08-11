import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import { Skeleton, Theme } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';
import { CodesContext } from 'contexts/codesContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import React, { useContext, useEffect, useState } from 'react';
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
  actionButton: {
    marginLeft: theme.spacing(1),
    minWidth: '6rem'
  },
  toolbarCount: {
    fontWeight: 400
  },
  filtersBox: {
    background: '#f7f8fa'
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

  const [openFundingSourceModal, setOpenFundingSourceModal] = useState(false);
  const [fundingSourceId, setFundingSourceId] = useState<number | null>();

  const classes = useStyles();
  const biohubApi = useBiohubApi();

  const codesContext = useContext(CodesContext);
  useEffect(() => codesContext.codesDataLoader.load(), [codesContext.codesDataLoader]);

  const fundingSourceDataLoader = useDataLoader(() => biohubApi.funding.getAllFundingSources());
  fundingSourceDataLoader.load();

  const closeModal = (refresh?: boolean) => {
    if (refresh) {
      fundingSourceDataLoader.refresh();
    }
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setFundingSourceId(null);
  };

  if (!codesContext.codesDataLoader.isReady || !fundingSourceDataLoader.isReady) {
    return (
      <>
        <Skeleton variant="rectangular" animation="wave" />
        <Skeleton variant="rectangular" animation="wave" />
      </>
    );
  }

  return (
    <>
      {/* CREATE FUNDING SOURCE */}
      <CreateFundingSource isModalOpen={isCreateModalOpen} closeModal={closeModal} />
      {/* FUNDING SOURCE DETAILS MODAL */}
      {fundingSourceId && openFundingSourceModal && (
        <FundingSourcePage
          fundingSourceId={fundingSourceId}
          open={openFundingSourceModal}
          onClose={() => setOpenFundingSourceModal(false)}
        />
      )}
      {/* EDIT FUNDING SOURCE MODAL */}
      {fundingSourceId && isEditModalOpen && (
        <EditFundingSource funding_source_id={fundingSourceId} isModalOpen={isEditModalOpen} closeModal={closeModal} />
      )}
      {/* DELETE FUNDING SOURCE MODAL */}
      {fundingSourceId && isDeleteModalOpen && (
        <DeleteFundingSource
          funding_source_id={fundingSourceId}
          isModalOpen={isDeleteModalOpen}
          closeModal={closeModal}
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
                  aria-label="Add Funding Source"
                  startIcon={<Icon path={mdiPlus} size={1} />}
                  onClick={() => setIsCreateModalOpen(true)}>
                  Add
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
              <Typography variant="h4" component="h2">
                Records Found &zwnj;
                <Typography className={classes.toolbarCount} component="span" variant="inherit" color="textSecondary">
                  ({fundingSourceDataLoader.data?.length || 0})
                </Typography>
              </Typography>
            </Toolbar>
            <Divider></Divider>
            <Box py={1} pb={2} px={3}>
              <FundingSourcesTable
                fundingSources={fundingSourceDataLoader.data || []}
                onView={(fundingSourceId) => {
                  setFundingSourceId(fundingSourceId);
                  setOpenFundingSourceModal(true);
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
