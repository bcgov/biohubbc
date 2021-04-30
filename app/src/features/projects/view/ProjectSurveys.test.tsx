import { render } from '@testing-library/react';
import React from 'react';
import ProjectSurveys from './ProjectSurveys';

describe('ProjectSurveys', () => {
  it('renders correctly', () => {
    const { asFragment } = render(<ProjectSurveys />);

    expect(asFragment()).toMatchSnapshot();
  });
});
