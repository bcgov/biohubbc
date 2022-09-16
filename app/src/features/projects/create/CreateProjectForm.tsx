import { Box, Button, Container, Divider, Paper, Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
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
    height: '1px'
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

  return (
    <>
      <Box my={3}>
        <Container maxWidth="xl">
          <Box py="3" component={Paper} display="block">
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
                  title="Coordinator"
                  summary=""
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
                  title="Details"
                  summary=""
                  component={
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
                  }></HorizontalSplitFormComponent>

                <Divider className={classes.sectionDivider} />

                <HorizontalSplitFormComponent
                  title="Objectives"
                  summary=""
                  component={<ProjectObjectivesForm />}></HorizontalSplitFormComponent>

                <Divider className={classes.sectionDivider} />

                <HorizontalSplitFormComponent
                  title="Location"
                  summary=""
                  component={<ProjectLocationForm />}></HorizontalSplitFormComponent>

                <Divider className={classes.sectionDivider} />

                <HorizontalSplitFormComponent
                  title="IUCN"
                  summary=""
                  component={
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
                  }></HorizontalSplitFormComponent>
                <Divider className={classes.sectionDivider} />

                <HorizontalSplitFormComponent
                  title="Funding"
                  summary=""
                  component={
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
                  }></HorizontalSplitFormComponent>

                <Divider className={classes.sectionDivider} />

                <HorizontalSplitFormComponent
                  title="Partnerships"
                  summary=""
                  component={
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
                  }></HorizontalSplitFormComponent>

                <Divider className={classes.sectionDivider} />
              </>
            </Formik>

            <Box p={3} display="flex" justifyContent="flex-end">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                onClick={() => formikRef.current?.submitForm()}
                className={classes.actionButton}>
                Save and Exit
              </Button>
              <Button variant="outlined" color="primary" onClick={handleCancel} className={classes.actionButton}>
                Cancel
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default CreateProjectForm;
