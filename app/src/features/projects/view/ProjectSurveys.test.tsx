import { render } from '@testing-library/react';
import React from 'react';
import ProjectSurveys from './ProjectSurveys';

describe('ProjectSurveys', () => {
  it('renders correctly', () => {
    const { getByText } = render(<ProjectSurveys />);

    expect(getByText('Surveys')).toBeInTheDocument();
    expect(getByText('Add Survey')).toBeInTheDocument();
    expect(getByText('Moose Survey 1')).toBeInTheDocument();
  });
});
