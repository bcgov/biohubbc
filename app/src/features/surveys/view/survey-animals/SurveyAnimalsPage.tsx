import { SurveySectionFullPageLayout } from 'features/surveys/components/SurveySectionFullPageLayout';
import React, { useState } from 'react';
import { AddEditAnimal } from './AddEditAnimal';
import { IAnimalSubSections } from './animal';
import AnimalList from './AnimalList';

export const SurveyAnimalsPage = () => {
  const [selectedSection, setSelectedSection] = useState<IAnimalSubSections>('General');
  return (
    <SurveySectionFullPageLayout
      pageTitle="Manage Animals"
      sideBarComponent={<AnimalList onSelectSection={(section) => setSelectedSection(section)} />}
      mainComponent={<AddEditAnimal section={selectedSection} />}
    />
  );
};
