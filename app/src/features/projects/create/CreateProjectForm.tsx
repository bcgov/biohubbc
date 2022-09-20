import { Box, Button, Divider, Typography } from '@material-ui/core';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import { ScrollToFormikError } from 'components/formik/ScrollToFormikError';
import { Formik, FormikProps } from 'formik';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { ICreateProjectRequest } from 'interfaces/useProjectApi.interface';
import React from 'react';
import ProjectCoordinatorForm, {
  ProjectCoordinatorInitialValues,
  ProjectCoordinatorYupSchema
} from '../components/ProjectCoordinatorForm';
import ProjectDetailsForm, {
  ProjectDetailsFormInitialValues,
  ProjectDetailsFormYupSchema
} from '../components/ProjectDetailsForm';
import ProjectFundingForm, {
  ProjectFundingFormInitialValues,
  ProjectFundingFormYupSchema
} from '../components/ProjectFundingForm';
import ProjectIUCNForm, { ProjectIUCNFormInitialValues, ProjectIUCNFormYupSchema } from '../components/ProjectIUCNForm';
import ProjectLocationForm, {
  ProjectLocationFormInitialValues,
  ProjectLocationFormYupSchema
} from '../components/ProjectLocationForm';
import ProjectObjectivesForm, {
  ProjectObjectivesFormInitialValues,
  ProjectObjectivesFormYupSchema
} from '../components/ProjectObjectivesForm';
import ProjectPartnershipsForm, {
  ProjectPartnershipsFormInitialValues,
  ProjectPartnershipsFormYupSchema
} from '../components/ProjectPartnershipsForm';

const useStyles = makeStyles((theme: Theme) => ({
  actionButton: {
    minWidth: '6rem',
    '& + button': {
      marginLeft: '0.5rem'
    }
  },
  sectionDivider: {
    height: '1px',
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(5)
  },
  breadCrumbLink: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer'
  },
  breadCrumbLinkIcon: {
    marginRight: '0.25rem'
  }
}));

export interface ICreateProjectForm {
  codes: IGetAllCodeSetsResponse;
  handleSubmit: (formikData: ICreateProjectRequest) => void;
  handleCancel: () => void;
  handleDraft: (value: React.SetStateAction<boolean>) => void;
  formikRef: React.RefObject<FormikProps<ICreateProjectRequest>>;
}

export const initialProjectFieldData: ICreateProjectRequest = {
  ...ProjectCoordinatorInitialValues,
  ...ProjectDetailsFormInitialValues,
  ...ProjectObjectivesFormInitialValues,
  ...ProjectLocationFormInitialValues,
  ...ProjectIUCNFormInitialValues,
  ...ProjectFundingFormInitialValues,
  ...ProjectPartnershipsFormInitialValues
};

export const validationProjectYupSchema = ProjectCoordinatorYupSchema.concat(ProjectDetailsFormYupSchema)
  .concat(ProjectObjectivesFormYupSchema)
  .concat(ProjectLocationFormYupSchema)
  .concat(ProjectIUCNFormYupSchema)
  .concat(ProjectFundingFormYupSchema)
  .concat(ProjectPartnershipsFormYupSchema);

/**
 * Form for creating a new project.
 *
 * @return {*}
 */
const CreateProjectForm: React.FC<ICreateProjectForm> = (props) => {
  const { codes, formikRef } = props;

  const classes = useStyles();

  const handleSubmit = async (formikData: ICreateProjectRequest) => {
    props.handleSubmit(formikData);
  };

  const handleCancel = () => {
    props.handleCancel();
  };

  const handleDraft = () => {
    props.handleDraft(true);
  };

  return (
    <Box p={5}>
      <Formik
        innerRef={formikRef}
        initialValues={initialProjectFieldData}
        validationSchema={validationProjectYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={handleSubmit}>
        <>
          <ScrollToFormikError fieldOrder={Object.keys(initialProjectFieldData)} />

          <HorizontalSplitFormComponent
            title="General Information"
            summary="Enter general information, objectives and timelines for the project."
            component={
              <>
                <ProjectDetailsForm
                  project_type={
                    codes?.project_type?.map((item) => {
                      return { value: item.id, label: item.name };
                    }) || []
                  }
                  activity={
                    codes?.activity?.map((item) => {
                      return { value: item.id, label: item.name };
                    }) || []
                  }
                />
                <Box mt={2}>
                  <ProjectObjectivesForm />
                </Box>
                <Box mt={5}>
                  <Typography variant="h3">IUCN Conservation Actions Classification</Typography>
                  <Box mt={1.5} maxWidth="90ch">
                    <Typography variant="body1" color="textSecondary">
                      Conservation actions are specific actions or sets of tasks undertaken by project staff designed to reach each of the project's objectives.
                    </Typography>
                  </Box>

                  <Box mt={4}>
                    <ProjectIUCNForm
                      classifications={
                        codes?.iucn_conservation_action_level_1_classification?.map((item) => {
                          return { value: item.id, label: item.name };
                        }) || []
                      }
                      subClassifications1={
                        codes?.iucn_conservation_action_level_2_subclassification?.map((item) => {
                          return { value: item.id, iucn1_id: item.iucn1_id, label: item.name };
                        }) || []
                      }
                      subClassifications2={
                        codes?.iucn_conservation_action_level_3_subclassification?.map((item) => {
                          return { value: item.id, iucn2_id: item.iucn2_id, label: item.name };
                        }) || []
                      }
                    />
                  </Box>
                </Box>
              </>
            }></HorizontalSplitFormComponent>

          <Divider className={classes.sectionDivider} />

          <HorizontalSplitFormComponent
            title="Project Coordinator"
            summary="Provide the Project Coordinator's contact and agency information."
            component={
              <ProjectCoordinatorForm
                coordinator_agency={
                  codes?.coordinator_agency?.map((item) => {
                    return item.name;
                  }) || []
                }
              />
            }></HorizontalSplitFormComponent>

          <Divider className={classes.sectionDivider} />

          <HorizontalSplitFormComponent
            title="Funding and Partnerships"
            summary="Specify project funding sources and additional partnerships."
            component={
              <>
                <Typography variant="h3">Funding</Typography>
                <Box mt={1.5} maxWidth="90ch">
                  <Typography variant="body1" color="textSecondary">
                    Specify funding sources for the project. <strong>Note:</strong> Dollar amounts are not intended to be exact, please round to the nearest 100.
                  </Typography>
                </Box>
                <Box mt={3.5}>
                  <ProjectFundingForm
                    funding_sources={
                      codes?.funding_source?.map((item) => {
                        return { value: item.id, label: item.name };
                      }) || []
                    }
                    investment_action_category={
                      codes?.investment_action_category?.map((item) => {
                        return { value: item.id, fs_id: item.fs_id, label: item.name };
                      }) || []
                    }
                  />
                </Box>
                <Box mt={5}>
                  <Typography variant="h3">Partnerships</Typography>
                  <Box mt={1.5} maxWidth="90ch">
                    <Typography variant="body1" color="textSecondary">
                      Additional partnerships that have not been previously identified as a funding sources.
                    </Typography>
                  </Box>
                  <Box mt={4}>
                    <ProjectPartnershipsForm
                      first_nations={
                        codes?.first_nations?.map((item) => {
                          return { value: item.id, label: item.name };
                        }) || []
                      }
                      stakeholder_partnerships={
                        codes?.funding_source?.map((item) => {
                          return { value: item.name, label: item.name };
                        }) || []
                      }
                    />
                  </Box>
                </Box>
              </>
            }></HorizontalSplitFormComponent>

          <Divider className={classes.sectionDivider} />

          <HorizontalSplitFormComponent
            title="Location and Boundary"
            summary="Provide details about the project's location and define the project spatial boundary"
            component={<ProjectLocationForm />}></HorizontalSplitFormComponent>

          <Divider className={classes.sectionDivider} />
        </>
      </Formik>

      <Box mt={4} display="flex" justifyContent="flex-end">
        <Button
          type="submit"
          variant="contained"
          color="primary"
          onClick={() => formikRef.current?.submitForm()}
          className={classes.actionButton}>
          Submit Project
        </Button>
        <Button variant="outlined" color="primary" onClick={handleDraft} className={classes.actionButton}>
          Save Draft
        </Button>
        <Button variant="outlined" color="primary" onClick={handleCancel} className={classes.actionButton}>
          Cancel
        </Button>
      </Box>

    </Box>
  );
};

export default CreateProjectForm;
