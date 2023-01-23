import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { EditSurveyPurposeAndMethodologyI18N } from 'constants/i18n';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import { IGetSurveyForViewResponse } from 'interfaces/useSurveyApi.interface';
import React, { useState } from 'react';

export interface ISurveyPurposeAndMethodologyDataProps {
  surveyForViewData: IGetSurveyForViewResponse;
  codes: IGetAllCodeSetsResponse;
  projectForViewData: IGetProjectForViewResponse;
  refresh: () => void;
}

/**
 * Purpose and Methodology data content for a survey.
 *
 * @return {*}
 */
const SurveyPurposeAndMethodologyData: React.FC<ISurveyPurposeAndMethodologyDataProps> = (props) => {
  const {
    surveyForViewData: {
      surveyData: { purpose_and_methodology }
    },
    codes
  } = props;

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
                    <Typography component="dd" variant="body1" key={index}>
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
