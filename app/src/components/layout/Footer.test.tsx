import { render } from 'test-helpers/test-utils';
import Footer from './Footer';

describe('Footer', () => {
  it('renders correctly', () => {
    const { asFragment } = render(<Footer />);

    expect(asFragment()).toMatchSnapshot();
  });
});
