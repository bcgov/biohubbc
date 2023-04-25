import { IGetProjectAttachment, IGetProjectReportAttachment } from 'interfaces/useProjectApi.interface';
import { default as React } from 'react';
import yup from 'utils/YupSchema';
import SelectAllButton from './SelectAllButton';
import SubmitSection from './SubmitSection';

export interface ISubmitProject {
  unSubmittedReports: IGetProjectReportAttachment[];
  unSubmittedAttachments: IGetProjectAttachment[];
}
export interface IProjectSubmitForm {
  reports: IGetProjectReportAttachment[];
  attachments: IGetProjectAttachment[];
}

export const ProjectSubmitFormInitialValues: IProjectSubmitForm = {
  reports: [],
  attachments: []
};

export const ProjectSubmitFormYupSchema = yup.object().shape({
  reports: yup.array(),
  attachments: yup.array()
});

const PublishProjectSections: React.FC<ISubmitProject> = (props) => {
  const { unSubmittedReports, unSubmittedAttachments } = props;

  return (
    <>
      <SelectAllButton
        formikData={[
          {
            key: 'reports',
            value: unSubmittedReports
          },
          {
            key: 'attachments',
            value: unSubmittedAttachments
          }
        ]}
      />

      {unSubmittedReports.length !== 0 && (
        <SubmitSection
          subHeader="Reports"
          formikName="reports"
          data={unSubmittedReports}
          getName={(item: IGetProjectReportAttachment) => {
            return item.fileName;
          }}
        />
      )}

      {unSubmittedAttachments.length !== 0 && (
        <SubmitSection
          subHeader="Other Documents"
          formikName="attachments"
          data={unSubmittedAttachments}
          getName={(item: IGetProjectAttachment) => {
            return item.fileName;
          }}
        />
      )}
    </>
  );
};

export default PublishProjectSections;
