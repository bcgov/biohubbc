import { Box, Button, Divider, Typography } from '@material-ui/core';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import { Formik, FormikProps } from 'formik';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IUpdateProjectRequest } from 'interfaces/useProjectApi.interface';
import React from 'react';
import ProjectCoordinatorForm from '../components/ProjectCoordinatorForm';
import ProjectDetailsForm from '../components/ProjectDetailsForm';
import ProjectFundingForm from '../components/ProjectFundingForm';
import ProjectIUCNForm from '../components/ProjectIUCNForm';
import ProjectLocationForm from '../components/ProjectLocationForm';
import ProjectObjectivesForm from '../components/ProjectObjectivesForm';
import ProjectPartnershipsForm from '../components/ProjectPartnershipsForm';
import { initialProjectFieldData, validationProjectYupSchema } from '../create/CreateProjectForm';

const useStyles = makeStyles((theme: Theme) => ({
  actionButton: {
    minWidth: '6rem',
    '& + button': {
      marginLeft: '0.5rem'
    }
  },
  sectionDivider: {
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(5)
  }
}));

export interface IEditProjectForm {
  codes: IGetAllCodeSetsResponse;
  projectData: IUpdateProjectRequest;
  handleSubmit: (formikData: IUpdateProjectRequest) => void;
  handleCancel: () => void;
  formikRef: React.RefObject<FormikProps<IUpdateProjectRequest>>;
}

/**
 * Form for creating a new project.
 *
 * @return {*}
 */
const EditProjectForm: React.FC<IEditProjectForm> = (props) => {
  const { codes, formikRef, projectData } = props;

  console.log('projectData', projectData);

  const classes = useStyles();

  const handleSubmit = async (formikData: IUpdateProjectRequest) => {
    props.handleSubmit(formikData);
  };

  const handleCancel = () => {
    props.handleCancel();
  };

  return (
    <Box p={5}>
      <Formik
        innerRef={formikRef}
        initialValues={(initialProjectFieldData as unknown) as IUpdateProjectRequest}
        validationSchema={validationProjectYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        enableReinitialize={true}
        onSubmit={handleSubmit}>
        <>
          {/* <ScrollToFormikError fieldOrder={Object.keys(initialProjectFieldData)} /> */}

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
                <Box component="fieldset" mt={5}>
                  <Typography component="legend" variant="h5">
                    IUCN Conservation Actions Classification
                  </Typography>
                  <Typography variant="body1" color="textSecondary" style={{ maxWidth: '90ch' }}>
                    Conservation actions are specific actions or sets of tasks undertaken by project staff designed to
                    reach each of the project's objectives.
                  </Typography>

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
                <Box component="fieldset">
                  <Typography component="legend" variant="h5">
                    Funding Sources
                  </Typography>
                  <Typography variant="body1" color="textSecondary" style={{ maxWidth: '90ch' }}>
                    Specify funding sources for the project. <strong>Note:</strong> Dollar amounts are not intended to
                    be exact, please round to the nearest 100.
                  </Typography>
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
                </Box>
                <Box component="fieldset" mt={5}>
                  <Typography component="legend" variant="h5">
                    Partnerships
                  </Typography>
                  <Typography variant="body1" color="textSecondary" style={{ maxWidth: '90ch' }}>
                    Additional partnerships that have not been previously identified as a funding sources.
                  </Typography>
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

      <Box display="flex" justifyContent="flex-end">
        <Button
          type="submit"
          color="primary"
          variant="contained"
          onClick={() => formikRef.current?.submitForm()}
          className={classes.actionButton}>
          Save Project
        </Button>
        <Button color="primary" variant="outlined" onClick={handleCancel} className={classes.actionButton}>
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

export default EditProjectForm;
