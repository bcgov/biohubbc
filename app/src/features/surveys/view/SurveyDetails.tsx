import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import SurveyGeneralInformation from 'features/surveys/view/components/SurveyGeneralInformation';
import SurveyProprietaryData from 'features/surveys/view/components/SurveyProprietaryData';
import React, { useContext } from 'react';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import { IGetSurveyForViewResponse } from 'interfaces/useSurveyApi.interface';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import SurveyStudyArea from './components/SurveyStudyArea';
import Button from '@material-ui/core/Button';
import Icon from '@mdi/react';
import { mdiDelete } from '@mdi/js';
import { DialogContext } from 'contexts/dialogContext';

export interface ISurveyDetailsProps {
  surveyForViewData: IGetSurveyForViewResponse;
  codes: IGetAllCodeSetsResponse;
  projectForViewData: IGetProjectForViewResponse;
  refresh: () => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  surveyDetailsSection: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(5),
    '&:last-child': {
      marginBottom: 0
    },
    '&:first-child': {
      marginTop: 0
    }
  }
}));

/**
 * Details content for a survey.
 *
 * @return {*}
 */
const SurveyDetails: React.FC<ISurveyDetailsProps> = (props) => {
  const { surveyForViewData, codes, refresh, projectForViewData } = props;

  const classes = useStyles();
  const dialogContext = useContext(DialogContext);

  const defaultYesNoDialogProps = {
    dialogTitle: 'Delete Survey',
    dialogText: 'Are you sure you want to delete this survey, its attachments and associated observations?',
    open: false,
    onClose: () => dialogContext.setYesNoDialog({ open: false }),
    onNo: () => dialogContext.setYesNoDialog({ open: false }),
    onYes: () => dialogContext.setYesNoDialog({ open: false })
  };

  const showDeleteSurveyDialog = () => {
    dialogContext.setYesNoDialog({
      ...defaultYesNoDialogProps,
      open: true,
      onYes: () => {
        deleteSurvey();
        dialogContext.setYesNoDialog({ open: false });
      }
    });
  };

  const deleteSurvey = () => {
    console.log('delete survey');
  };

  return (
    <>
      <Box mb={5} display="flex" justifyContent="space-between">
        <Typography variant="h2">Survey Details</Typography>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<Icon path={mdiDelete} size={1} />}
          onClick={showDeleteSurveyDialog}>
          Delete Survey
        </Button>
      </Box>

      <Box component={Paper} p={4}>
        <Box component="section" className={classes.surveyDetailsSection}>
          <SurveyGeneralInformation
            projectForViewData={projectForViewData}
            surveyForViewData={surveyForViewData}
            codes={codes}
            refresh={refresh}
          />
        </Box>
      </Box>

      <Box component={Paper} p={4} mt={4}>
        <Box component="section" className={classes.surveyDetailsSection}>
          <SurveyStudyArea
            surveyForViewData={surveyForViewData}
            projectForViewData={projectForViewData}
            refresh={refresh}
          />
        </Box>
      </Box>

      <Box component={Paper} p={4} mt={4}>
        <Box component="section" className={classes.surveyDetailsSection}>
          <SurveyProprietaryData
            projectForViewData={projectForViewData}
            surveyForViewData={surveyForViewData}
            codes={codes}
            refresh={refresh}
          />
        </Box>
      </Box>
    </>
  );
};

export default SurveyDetails;
