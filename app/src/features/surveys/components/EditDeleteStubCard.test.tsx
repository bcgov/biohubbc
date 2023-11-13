import { fireEvent, render } from 'test-helpers/test-utils';
import { EditDeleteStubCard } from './EditDeleteStubCard';

const handle = jest.fn();

it('renders delete icon when delete handler provided', () => {
  const { getByTestId, getByText, queryByTestId } = render(
    <EditDeleteStubCard onClickDelete={handle} header="test-header" subHeader="test-subheader" />
  );
  expect(getByText('test-header')).toBeInTheDocument();
  expect(getByText('test-subheader')).toBeInTheDocument();
  expect(getByTestId('delete-icon')).toBeInTheDocument();
  expect(queryByTestId('edit-icon')).not.toBeInTheDocument();
  fireEvent.click(getByTestId('delete-icon'));
  expect(handle).toHaveBeenCalled();
});

it('renders edit icon when edit handler provided', () => {
  const { getByTestId, getByText, queryByTestId } = render(
    <EditDeleteStubCard onClickEdit={handle} header="test-header" subHeader="test-subheader" />
  );
  expect(getByText('test-header')).toBeInTheDocument();
  expect(getByText('test-subheader')).toBeInTheDocument();
  expect(queryByTestId('delete-icon')).not.toBeInTheDocument();
  expect(getByTestId('edit-icon')).toBeInTheDocument();
  fireEvent.click(getByTestId('edit-icon'));
  expect(handle).toHaveBeenCalled();
});
