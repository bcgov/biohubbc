import ProjectCoordinatorForm from 'features/projects/components/ProjectCoordinatorForm';
import ProjectDetailsForm from 'features/projects/components/ProjectDetailsForm';
import ProjectFundingForm from 'features/projects/components/ProjectFundingForm';
import ProjectIUCNForm from 'features/projects/components/ProjectIUCNForm';
import ProjectLocationForm from 'features/projects/components/ProjectLocationForm';
import ProjectObjectivesForm from 'features/projects/components/ProjectObjectivesForm';
import ProjectPartnershipsForm from 'features/projects/components/ProjectPartnershipsForm';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import React from 'react';

export interface IProjectStepComponentsProps {
  component: string;
  codes: IGetAllCodeSetsResponse;
}

/**
 * Determine the appropriate component to return for the project step
 *
 * @return {*}
 */
const ProjectStepComponents: React.FC<IProjectStepComponentsProps> = (props) => {
  const { component, codes } = props;

  return (
    <>
      {component === 'ProjectCoordinator' && (
        <ProjectCoordinatorForm
          coordinator_agency={
            codes?.coordinator_agency?.map((item) => {
              return item.name;
            }) || []
          }
        />
      )}

      {component === 'ProjectDetails' && (
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
      )}

      {component === 'ProjectObjectives' && <ProjectObjectivesForm />}

      {component === 'ProjectLocation' && <ProjectLocationForm />}

      {component === 'ProjectIUCN' && (
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
      )}

      {component === 'ProjectFunding' && (
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
      )}

      {component === 'ProjectPartnerships' && (
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
      )}
    </>
  );
};

export default ProjectStepComponents;
