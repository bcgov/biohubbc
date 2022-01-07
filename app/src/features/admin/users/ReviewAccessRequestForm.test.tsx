import { render, waitFor } from '@testing-library/react';
import ReviewAccessRequestForm, {
  ReviewAccessRequestFormYupSchema
} from 'features/admin/users/ReviewAccessRequestForm';
import { Formik } from 'formik';
import { IGetAccessRequestsListResponse } from 'interfaces/useAdminApi.interface';
import React from 'react';
import { codes } from 'test-helpers/code-helpers';

const renderContainer = (accessRequest: IGetAccessRequestsListResponse) => {
  return render(
    <Formik
      initialValues={{ system_roles: [2] }}
      enableReinitialize={true}
      validationSchema={ReviewAccessRequestFormYupSchema}
      validateOnBlur={true}
      validateOnChange={false}
      onSubmit={() => {}}>
      {() => (
        <ReviewAccessRequestForm
          request={accessRequest}
          system_roles={codes.system_roles.map((item) => {
            return { value: item.id, label: item.name };
          })}
        />
      )}
    </Formik>
  );
};

describe('ReviewAccessRequestForm', () => {
  it('renders all fields from the request object', async () => {
    const { getByText } = renderContainer({
      id: 1,
      type: 2,
      type_name: 'test type name',
      status: 3,
      status_name: 'test status name',
      description: 'test description',
      notes: 'test node',
      create_date: '2021-04-18',
      data: {
        name: 'test data name',
        username: 'test data username',
        email: 'test data email',
        identitySource: 'idir',
        role: 2,
        company: 'test data company',
        comments: 'test data comment',
        request_reason: 'reason for request'
      }
    });

    await waitFor(() => {
      expect(getByText('test data name')).toBeVisible();
      expect(getByText('IDIR/test data username')).toBeVisible();
      expect(getByText('test data email')).toBeVisible();
      expect(getByText('04/18/2021')).toBeVisible();
      expect(getByText('test data comment')).toBeVisible();
      expect(getByText('Role 2')).toBeVisible();
    });
  });
});
