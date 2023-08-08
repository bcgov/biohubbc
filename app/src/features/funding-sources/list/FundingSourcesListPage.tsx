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
import { DialogContext, ISnackbarProps } from 'contexts/dialogContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import React, { useContext, useEffect, useState } from 'react';
import yup from 'utils/YupSchema';
import FundingSourceForm, { IFundingSourceData } from '../components/FundingSourceForm';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const classes = useStyles();
  const biohubApi = useBiohubApi();
  const dialogContext = useContext(DialogContext);

  // This is placed inside the `FundingSourcesListPage` to make use of an API call to check for used names
  // The API call would violate the rules of react hooks if placed in an object outside of the component
  // Reference: https://react.dev/warnings/invalid-hook-call-warning
  const FundingSourceYupSchema = yup.object().shape({
    funding_source_id: yup.number().nullable(),
    name: yup
      .string()
      .required('A funding source name is required')
      .test('nameUsed', 'This name has already been used', async (val) => {
        let hasBeenUsed = false;
        if (val) {
          hasBeenUsed = await biohubApi.funding.hasFundingSourceNameBeenUsed(val);
        }
        return !hasBeenUsed;
      }),
    description: yup.string().max(200).required('A description is required'),
    start_date: yup.string().isValidDateString().nullable(),
    end_date: yup.string().isValidDateString().isEndDateSameOrAfterStartDate('start_date').nullable()
  });

  const showSnackBar = (textDialogProps?: Partial<ISnackbarProps>) => {
    dialogContext.setSnackbar({ ...textDialogProps, open: true });
  };
  const codesContext = useContext(CodesContext);
  useEffect(() => codesContext.codesDataLoader.load(), [codesContext.codesDataLoader]);

  const fundingSourceDataLoader = useDataLoader(() => biohubApi.funding.getAllFundingSources());
  fundingSourceDataLoader.load();

  // const showCreateErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
  //   dialogContext.setErrorDialog({
  //     dialogTitle: CreateFundingSourceI18N.createErrorTitle,
  //     dialogText: CreateFundingSourceI18N.createErrorText,
  //     ...defaultErrorDialogProps,
  //     ...textDialogProps,
  //     open: true
  //   });
  // };

  const handleSubmitDraft = async (values: IFundingSourceData) => {
    setIsSubmitting(true);
    try {
      if (values.funding_source_id) {
        // edit the funding source
        await biohubApi.funding.putFundingSource(values);
      } else {
        await biohubApi.funding.postFundingSource(values);
      }
      setIsSubmitting(false);
      setIsModalOpen(false);

      fundingSourceDataLoader.refresh();

      showSnackBar({
        snackbarMessage: (
          <>
            <Typography variant="body2" component="div">
              Funding Source: <strong>{values.name}</strong> has been created.
            </Typography>
          </>
        ),
        open: true
      });
      // refresh the list
    } catch (error) {
      console.log('Show an error dialog');
    }
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
        dialogLoading={isSubmitting}
        component={{
          element: <FundingSourceForm />,
          initialValues: {
            funding_source_id: null,
            name: '',
            description: '',
            start_date: null,
            end_date: null
          },
          validationSchema: FundingSourceYupSchema
        }}
        dialogSaveButtonLabel="Add"
        onCancel={() => setIsModalOpen(false)}
        onSave={(formValues) => {
          handleSubmitDraft(formValues);
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
              <FundingSourcesTable fundingSources={fundingSourceDataLoader.data || []} />
            </Box>
          </Paper>
        </Box>
      </Container>
    </>
  );
};

export default FundingSourcesListPage;
