import { fireEvent, render, waitFor } from 'test-helpers/test-utils';
import SurveyAnimalsTableActions from './SurveyAnimalsTableActions';

describe('SurveyAnimalsTableActions', () => {
  const onAddDevice = vi.fn();
  const onRemoveCritter = vi.fn();
  const onEditCritter = vi.fn();

  it('all buttons should be clickable', async () => {
    const { getByTestId } = render(
      <SurveyAnimalsTableActions
        critter_id={1}
        devices={[]}
        onAddDevice={onAddDevice}
        onEditDevice={() => {}}
        onEditCritter={onEditCritter}
        onRemoveCritter={onRemoveCritter}
        onMenuOpen={() => {}}
        onMapOpen={() => {}}
      />
    );

    fireEvent.click(getByTestId('animal actions'));

    await waitFor(() => {
      expect(getByTestId('animal-table-row-add-device')).toBeInTheDocument();
      expect(getByTestId('animal-table-row-remove-critter')).toBeInTheDocument();
    });

    fireEvent.click(getByTestId('animal-table-row-add-device'));
    expect(onAddDevice.mock.calls.length).toBe(1);

    fireEvent.click(getByTestId('animal-table-row-remove-critter'));
    expect(onRemoveCritter.mock.calls.length).toBe(1);

    fireEvent.click(getByTestId('animal-table-row-edit-critter'));
    expect(onEditCritter.mock.calls.length).toBe(1);
  });
});
