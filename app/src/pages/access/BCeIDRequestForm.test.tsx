import { Formik } from 'formik';
import { SYSTEM_IDENTITY_SOURCE } from 'hooks/useKeycloakWrapper';
import { render } from 'test-helpers/test-utils';
import BCeIDRequestForm, {
  BCeIDBasicRequestFormInitialValues,
  BCeIDBasicRequestFormYupSchema
} from './BCeIDRequestForm';

describe('BCeIDRequestForm', () => {
  it('matches the snapshot', () => {
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
