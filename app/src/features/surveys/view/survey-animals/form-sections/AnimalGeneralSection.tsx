import { useAnimalFormData } from '../useAnimalFormData';

const AnimalGeneralSection = () => {
  const { data, updateData } = useAnimalFormData();
  console.log(data, updateData);
  return <div>General</div>;
};

export default AnimalGeneralSection;
