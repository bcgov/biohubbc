import { SurveySectionFullPageLayout } from 'features/surveys/components/SurveySectionFullPageLayout';
import React, { useState } from 'react';
import { AddEditAnimal } from './AddEditAnimal';
import { IAnimalSubSections } from './animal';
import AnimalList from './AnimalList';

export const SurveyAnimalsPage = () => {
  const [selectedSection, setSelectedSection] = useState<IAnimalSubSections>('General');
  const [selectedCritterID, setSelectedCritterID] = useState<string | null>(null);
  return (
    <SurveySectionFullPageLayout
      pageTitle="Manage Animals"
      sideBarComponent={
        <AnimalList
          selectedCritter={selectedCritterID}
          onSelectSection={(section) => setSelectedSection(section)}
          onSelectCritter={(critter_id) => setSelectedCritterID(critter_id)}
        />
      }
      mainComponent={<AddEditAnimal critter_id={selectedCritterID} section={selectedSection} />}
    />
  );
};
