import { SYSTEM_IDENTITY_SOURCE } from 'constants/auth';
import ReviewAccessRequestForm, {
  ReviewAccessRequestFormInitialValues,
  ReviewAccessRequestFormYupSchema
} from 'features/admin/users/ReviewAccessRequestForm';
import { Formik } from 'formik';
import { IGetAccessRequestsListResponse } from 'interfaces/useAdminApi.interface';
import { codes } from 'test-helpers/code-helpers';
import { render, waitFor } from 'test-helpers/test-utils';

describe('ReviewAccessRequestForm', () => {
  describe('IDIR Request', () => {
    it('renders all fields from the request object', async () => {
      const requestData: IGetAccessRequestsListResponse = {
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
          userGuid: 'aaaa',
          email: 'test data email',
          identitySource: SYSTEM_IDENTITY_SOURCE.IDIR,
          displayName: 'test user',
          role: 2,
          reason: 'reason for request'
        }
      };

      const { getByText } = render(
        <Formik
          initialValues={{ system_role: 2 }}
          enableReinitialize={true}
          validationSchema={ReviewAccessRequestFormYupSchema}
          validateOnBlur={true}
          validateOnChange={false}
          onSubmit={() => {}}>
          {() => (
            <ReviewAccessRequestForm
              request={requestData}
              system_roles={codes.system_roles.map((item) => {
                return { value: item.id, label: item.name };
              })}
            />
          )}
        </Formik>
      );

      await waitFor(() => {
        expect(getByText('test data name')).toBeVisible();
        expect(getByText('IDIR/test data username')).toBeVisible();
        expect(getByText('test data email')).toBeVisible();
        expect(getByText('04/18/2021')).toBeVisible();
      });
    });
  });

  describe('BCeID Request', () => {
    it('renders all fields from the request object', async () => {
      const requestData: IGetAccessRequestsListResponse = {
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
          userGuid: 'aaaa',
          email: 'test data email',
          identitySource: SYSTEM_IDENTITY_SOURCE.BCEID_BASIC,
          displayName: 'test user',
          company: 'test company',
          reason: 'reason for request'
        }
      };

      const { getByText } = render(
        <Formik
          initialValues={ReviewAccessRequestFormInitialValues}
          enableReinitialize={true}
          validationSchema={ReviewAccessRequestFormYupSchema}
          validateOnBlur={true}
          validateOnChange={false}
          onSubmit={() => {}}>
          {() => (
            <ReviewAccessRequestForm
              request={requestData}
              system_roles={codes.system_roles.map((item) => {
                return { value: item.id, label: item.name };
              })}
            />
          )}
        </Formik>
      );

      await waitFor(() => {
        expect(getByText('test data name')).toBeVisible();
        expect(getByText('BCeID Basic/test data username')).toBeVisible();
        expect(getByText('test data email')).toBeVisible();
        expect(getByText('04/18/2021')).toBeVisible();
        expect(getByText('test company')).toBeVisible();
      });
    });
  });
});
