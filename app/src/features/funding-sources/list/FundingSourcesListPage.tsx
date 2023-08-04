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
import EditDialog from 'components/dialog/EditDialog';
import { CodesContext } from 'contexts/codesContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import React, { useContext, useEffect, useState } from 'react';
import FundingSourceForm, { FundingSourceData, FundingSourceYupSchema } from '../components/FundingSourceForm';
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const classes = useStyles();
  const biohubApi = useBiohubApi();

  const codesContext = useContext(CodesContext);
  useEffect(() => codesContext.codesDataLoader.load(), [codesContext.codesDataLoader]);

  const fundingSourceDataLoader = useDataLoader(() => biohubApi.funding.getAllFundingSources());
  fundingSourceDataLoader.load();

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
                  startIcon={<Icon path={mdiPlus} size={1} />}
                  onClick={() => {
                    setIsModalOpen(true);
                  }}>
                  Add Funding Source
                </Button>
              </Box>
            </Box>
          </Box>
        </Container>
      </Paper>
      <EditDialog
        dialogTitle="Add New Funding Source"
        open={isModalOpen}
        component={{
          element: <FundingSourceForm />,
          initialValues: {
            funding_source_id: null,
            name: '',
            description: '',
            start_date: '',
            end_date: ''
          } as FundingSourceData,
          validationSchema: FundingSourceYupSchema
        }}
        dialogSaveButtonLabel="Add"
        onCancel={() => setIsModalOpen(false)}
        onSave={(formValues) => {
          console.log('SUBMIT THIS FORM PLS');
          console.log(formValues);
        }}
      />
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
              <FundingSourcesTable fundingSources={[]} />
            </Box>
          </Paper>
        </Box>
      </Container>
    </>
  );
};

export default FundingSourcesListPage;
