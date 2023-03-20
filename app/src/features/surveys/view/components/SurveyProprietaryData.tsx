import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { EditSurveyProprietorI18N } from 'constants/i18n';
import { SurveyContext } from 'contexts/surveyContext';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React, { useContext, useState } from 'react';

export interface ISurveyProprietaryDataProps {
  codes: IGetAllCodeSetsResponse;
  projectForViewData: IGetProjectForViewResponse;
}

/**
 * Proprietary data content for a survey.
 *
 * @return {*}
 */
const SurveyProprietaryData: React.FC<ISurveyProprietaryDataProps> = (props) => {
  const surveyContext = useContext(SurveyContext);
  const surveyForViewData = surveyContext.surveyDataLoader.data;

  const [errorDialogProps, setErrorDialogProps] = useState<IErrorDialogProps>({
    dialogTitle: EditSurveyProprietorI18N.editErrorTitle,
    dialogText: EditSurveyProprietorI18N.editErrorText,
    open: false,
    onClose: () => {
      setErrorDialogProps({ ...errorDialogProps, open: false });
    },
    onOk: () => {
      setErrorDialogProps({ ...errorDialogProps, open: false });
    }
  });

  if (!surveyForViewData) {
    return <></>;
  }

  const {
    surveyData: { proprietor }
  } = surveyForViewData;

  return (
    <>
      <Box>
        <dl>
          {!proprietor && (
            <Grid container spacing={1}>
              <Grid item>
                <Typography>The data captured in this survey is not proprietary.</Typography>
              </Grid>
            </Grid>
          )}
          {proprietor && (
            <Grid container spacing={1}>
              <Grid item xs={12} sm={6}>
                <Typography component="dt" variant="subtitle2" color="textSecondary">
                  Proprietor Name
                </Typography>
                <Typography component="dd" variant="body1">
                  {proprietor.proprietor_name}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography component="dt" variant="subtitle2" color="textSecondary">
                  Data Category
                </Typography>
                <Typography component="dd" variant="body1">
                  {proprietor.proprietor_type_name}
                </Typography>
              </Grid>
              <Grid item>
                <Typography component="dt" variant="subtitle2" color="textSecondary">
                  Category Rationale
                </Typography>
                <Typography style={{ wordBreak: 'break-all' }}>{proprietor.category_rationale}</Typography>
              </Grid>
            </Grid>
          )}
        </dl>
      </Box>
    </>
  );
};

export default SurveyProprietaryData;
