import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import CustomTextField from 'components/fields/CustomTextField';
import StepperWizard, { IStepperWizardStep } from 'components/stepper-wizard/StepperWizard';
import React from 'react';
import yup from 'utils/YupSchema';

export interface ISampleFormikFormProps {
  testField: string;
}

export const SampleFormikFormYupSchema = yup.object().shape({
  testField: yup.string().required('You must provide a value for testField')
});

const SampleFormikForm = () => {
  return (
    <form>
      <CustomTextField name="testField" label="Test Field" other={{ multiline: true, required: true, rows: 4 }} />
    </form>
  );
};

const renderContainer = (
  activeStep: number,
  steps: IStepperWizardStep[],
  innerRef: any,
  onNext: () => void,
  onPrevious: () => void,
  onSubmit: () => void,
  onSubmitLabel: string,
  onCancel: () => void,
  onChangeStep: (stepIndex: number) => void
) => {
  return render(
    <StepperWizard
      activeStep={activeStep}
      steps={steps}
      innerRef={innerRef}
      onChangeStep={onChangeStep}
      onPrevious={onPrevious}
      onNext={onNext}
      onSubmit={onSubmit}
      onSubmitLabel={onSubmitLabel}
      onCancel={onCancel}
    />
  );
};

describe('StepperWizard', () => {
  describe('with 0 step forms', () => {
    it('renders correctly with no steps', () => {
      const innerRef = { current: null };
      const onNext = jest.fn();
      const onPrevious = jest.fn();
      const onSubmit = jest.fn();
      const onSubmitLabel = 'test submit label';
      const onCancel = jest.fn();
      const onChangeStep = jest.fn();

      const { asFragment } = renderContainer(
        0,
        [],
        innerRef,
        onNext,
        onPrevious,
        onSubmit,
        onSubmitLabel,
        onCancel,
        onChangeStep
      );

      // should render an essentially empty component
      expect(asFragment()).toMatchSnapshot();
    });
  });

  describe('with 2 step forms', () => {
    const innerRef = { current: null };
    const onNext = jest.fn();
    const onPrevious = jest.fn();
    const onSubmit = jest.fn();
    const onSubmitLabel = 'test submit label';
    const onCancel = jest.fn();
    const onChangeStep = jest.fn();

    afterEach(() => {
      jest.clearAllMocks();
      cleanup();
    });

    it('renders correctly with 2 steps', async () => {
      const { getAllByText, getByText } = renderContainer(
        0,
        [
          {
            stepTitle: 'Test Step Title 1',
            stepSubTitle: 'Test Step Description 1',
            stepContent: <SampleFormikForm />,
            stepInitialValues: {
              testfield: ''
            },
            stepYupSchema: SampleFormikFormYupSchema,
            isValid: false,
            isTouched: false
          },
          {
            stepTitle: 'Test Step Title 2',
            stepSubTitle: 'Test Step Description 2',
            stepContent: <SampleFormikForm />,
            stepInitialValues: {
              testfield: ''
            },
            stepYupSchema: SampleFormikFormYupSchema,
            isValid: false,
            isTouched: false
          }
        ],
        innerRef,
        onNext,
        onPrevious,
        onSubmit,
        onSubmitLabel,
        onCancel,
        onChangeStep
      );

      await waitFor(() => {
        expect(getAllByText('Test Step Title 1').length).toEqual(2);
        expect(getByText('Test Step Description 1')).toBeVisible();

        expect(getByText('Test Step Title 2')).toBeVisible();
      });
    });

    it('calls onSubmit prop on submit button click', async () => {
      const { getByTestId } = renderContainer(
        0,
        [
          {
            stepTitle: 'Test Step Title 1',
            stepSubTitle: 'Test Step Description 1',
            stepContent: <SampleFormikForm />,
            stepInitialValues: {
              testfield: ''
            },
            stepYupSchema: SampleFormikFormYupSchema,
            isValid: true,
            isTouched: false
          },
          {
            stepTitle: 'Test Step Title 2',
            stepSubTitle: 'Test Step Description 2',
            stepContent: <SampleFormikForm />,
            stepInitialValues: {
              testfield: ''
            },
            stepYupSchema: SampleFormikFormYupSchema,
            isValid: false,
            isTouched: false
          }
        ],
        innerRef,
        onNext,
        onPrevious,
        onSubmit,
        onSubmitLabel,
        onCancel,
        onChangeStep
      );

      fireEvent.click(getByTestId('stepper_submit'));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledTimes(1);
      });
    });

    it('calls onNext props on next button click', async () => {
      const { getByTestId } = renderContainer(
        0,
        [
          {
            stepTitle: 'Test Step Title 1',
            stepSubTitle: 'Test Step Description 1',
            stepContent: <SampleFormikForm />,
            stepInitialValues: {
              testfield: ''
            },
            stepYupSchema: SampleFormikFormYupSchema,
            isValid: false,
            isTouched: true
          },
          {
            stepTitle: 'Test Step Title 2',
            stepSubTitle: 'Test Step Description 2',
            stepContent: <SampleFormikForm />,
            stepInitialValues: {
              testfield: ''
            },
            stepYupSchema: SampleFormikFormYupSchema,
            isValid: false,
            isTouched: false
          }
        ],
        innerRef,
        onNext,
        onPrevious,
        onSubmit,
        onSubmitLabel,
        onCancel,
        onChangeStep
      );

      fireEvent.click(getByTestId('stepper_next'));

      await waitFor(() => {
        expect(onNext).toHaveBeenCalledTimes(1);
      });
    });

    it('calls onPrevious prop on previous button click', async () => {
      const { getByTestId } = renderContainer(
        1,
        [
          {
            stepTitle: 'Test Step Title 1',
            stepSubTitle: 'Test Step Description 1',
            stepContent: <SampleFormikForm />,
            stepInitialValues: {
              testfield: ''
            },
            stepYupSchema: SampleFormikFormYupSchema,
            isValid: true,
            isTouched: true
          },
          {
            stepTitle: 'Test Step Title 2',
            stepSubTitle: 'Test Step Description 2',
            stepContent: <SampleFormikForm />,
            stepInitialValues: {
              testfield: ''
            },
            stepYupSchema: SampleFormikFormYupSchema,
            isValid: false,
            isTouched: false
          }
        ],
        innerRef,
        onNext,
        onPrevious,
        onSubmit,
        onSubmitLabel,
        onCancel,
        onChangeStep
      );

      fireEvent.click(getByTestId('stepper_previous'));

      await waitFor(() => {
        expect(onPrevious).toHaveBeenCalledTimes(1);
      });
    });

    it('calls onCancel prop on cancel button click', async () => {
      const { getByTestId } = renderContainer(
        0,
        [
          {
            stepTitle: 'Test Step Title 1',
            stepSubTitle: 'Test Step Description 1',
            stepContent: <SampleFormikForm />,
            stepInitialValues: {
              testfield: ''
            },
            stepYupSchema: SampleFormikFormYupSchema,
            isValid: true,
            isTouched: true
          },
          {
            stepTitle: 'Test Step Title 2',
            stepSubTitle: 'Test Step Description 2',
            stepContent: <SampleFormikForm />,
            stepInitialValues: {
              testfield: ''
            },
            stepYupSchema: SampleFormikFormYupSchema,
            isValid: true,
            isTouched: true
          }
        ],
        innerRef,
        onNext,
        onPrevious,
        onSubmit,
        onSubmitLabel,
        onCancel,
        onChangeStep
      );

      fireEvent.click(getByTestId('stepper_cancel'));

      await waitFor(() => {
        expect(onCancel).toHaveBeenCalledTimes(1);
      });
    });
  });
});
