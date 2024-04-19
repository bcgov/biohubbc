import { SYSTEM_IDENTITY_SOURCE } from 'constants/auth';
import { Formik } from 'formik';
import { render } from 'test-helpers/test-utils';
import BCeIDRequestForm, {
  BCeIDBasicRequestFormInitialValues,
  BCeIDBasicRequestFormYupSchema
} from './BCeIDRequestForm';

describe('BCeIDRequestForm', () => {
  it('renders correctly', () => {
    const { getByTestId } = render(
      <Formik
        initialValues={BCeIDBasicRequestFormInitialValues}
        validationSchema={BCeIDBasicRequestFormYupSchema}
        onSubmit={async () => {}}>
        {() => <BCeIDRequestForm accountType={SYSTEM_IDENTITY_SOURCE.BCEID_BUSINESS} />}
      </Formik>
    );

    expect(getByTestId('company')).toBeVisible();
    expect(getByTestId('reason')).toBeVisible();
  });
});
