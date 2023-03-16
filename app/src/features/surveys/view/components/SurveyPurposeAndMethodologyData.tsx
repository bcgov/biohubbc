import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { EditSurveyPurposeAndMethodologyI18N } from 'constants/i18n';
import { useSurveyContext } from 'contexts/surveyContext';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React, { useState } from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  vantageCodes: {
    position: 'relative',
    display: 'inline-block',
    marginRight: theme.spacing(1.25),
    '&::after': {
      content: `','`,
      position: 'absolute',
      top: 0
    },
    '&:last-child::after': {
      display: 'none'
    }
  }
}));

export interface ISurveyPurposeAndMethodologyDataProps {
  codes: IGetAllCodeSetsResponse;
  projectForViewData: IGetProjectForViewResponse;
}

/**
 * Purpose and Methodology data content for a survey.
 *
 * @return {*}
 */
const SurveyPurposeAndMethodologyData: React.FC<ISurveyPurposeAndMethodologyDataProps> = (props) => {
  const classes = useStyles();
  const surveyContext = useSurveyContext();
  const surveyForViewData = surveyContext.surveyDataLoader.data;

  const [errorDialogProps, setErrorDialogProps] = useState<IErrorDialogProps>({
    dialogTitle: EditSurveyPurposeAndMethodologyI18N.editErrorTitle,
    dialogText: EditSurveyPurposeAndMethodologyI18N.editErrorText,
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
    surveyData: { purpose_and_methodology }
  } = surveyForViewData;
  const { codes } = props;

  return (
    <>
      <Box>
        <dl>
          {!purpose_and_methodology && (
            <Grid container spacing={1}>
              <Grid item>
                <Typography>
                  The data captured in this survey does not have the purpose and methodology section.
                </Typography>
              </Grid>
            </Grid>
          )}
          {purpose_and_methodology && (
            <Grid container spacing={1}>
              <Grid item xs={12} sm={6}>
                <Typography component="dt" variant="subtitle2" color="textSecondary">
                  Intended Outcome
                </Typography>
                <Typography component="dd" variant="body1">
                  {purpose_and_methodology.intended_outcome_id &&
                    codes?.intended_outcomes?.find(
                      (item: any) => item.id === purpose_and_methodology.intended_outcome_id
                    )?.name}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography component="dt" variant="subtitle2" color="textSecondary">
                  Field Method
                </Typography>
                <Typography component="dd" variant="body1">
                  {purpose_and_methodology.field_method_id &&
                    codes?.field_methods?.find((item: any) => item.id === purpose_and_methodology.field_method_id)
                      ?.name}
                </Typography>
                <Typography component="dd" variant="body1"></Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography component="dt" variant="subtitle2" color="textSecondary">
                  Ecological Season
                </Typography>
                <Typography component="dd" variant="body1">
                  {purpose_and_methodology.ecological_season_id &&
                    codes?.ecological_seasons?.find(
                      (item: any) => item.id === purpose_and_methodology.ecological_season_id
                    )?.name}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography component="dt" variant="subtitle2" color="textSecondary">
                  Vantage Code
                </Typography>
                {purpose_and_methodology.vantage_code_ids?.map((vc_id: number, index: number) => {
                  return (
                    <Typography component="dd" variant="body1" key={index} className={classes.vantageCodes}>
                      {codes?.vantage_codes?.find((item: any) => item.id === vc_id)?.name}
                    </Typography>
                  );
                })}
              </Grid>
              <Grid item xs={12}>
                <Typography component="dt" variant="subtitle2" color="textSecondary">
                  Additional Details
                </Typography>
                {purpose_and_methodology.additional_details ? (
                  <Typography component="dd" variant="body1">
                    {purpose_and_methodology.additional_details}
                  </Typography>
                ) : (
                  <Typography component="dd" variant="body1">
                    No additional details
                  </Typography>
                )}
              </Grid>
            </Grid>
          )}
        </dl>
      </Box>
    </>
  );
};

export default SurveyPurposeAndMethodologyData;
