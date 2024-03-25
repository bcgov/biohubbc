import { AxiosInstance } from 'axios';
import { AnimalRelationship, ICreateCritterFamily } from 'features/surveys/view/survey-animals/animal';
import { IFamilyChildResponse, IFamilyParentResponse } from 'interfaces/useCritterApi.interface';
import { v4 } from 'uuid';

interface ICritterStub {
  critter_id: string;
  animal_id: string | null;
}

export type IFamily = {
  family_id: string;
  family_label: string;
};

export type IImmediateFamily = {
  parents: ICritterStub[];
  siblings: ICritterStub[];
  children: ICritterStub[];
};

type CreateChildRelationship = Omit<ICreateCritterFamily, 'relationship' | 'critter_id'> & { child_critter_id: string };
type CreateParentRelationship = Omit<ICreateCritterFamily, 'relationship' | 'critter_id'> & {
  parent_critter_id: string;
};

export const useFamilyApi = (axios: AxiosInstance) => {
  /**
   * Get all Critterbase families.
   *
   * @async
   * @returns {Promise<IFamily[]>} Critter families.
   */
  const getAllFamilies = async (): Promise<IFamily[]> => {
    const { data } = await axios.get('/api/critterbase/family');

    return data;
  };

  /**
   * Get immediate family of a specific critter.
   *
   * @async
   * @param {string} family_id - Family primary key identifier.
   * @returns {Promise<IImmediateFamily>} The critters parents, children and siblings.
   */
  const getImmediateFamily = async (family_id: string): Promise<IImmediateFamily> => {
    const { data } = await axios.get(`/api/critterbase/family/${family_id}`);

    return data;
  };

  /**
   * Create a new family.
   * Families must be created before parents or children can be added.
   *
   * @async
   * @param {string} label - The family's label. example: `caribou-2024-skeena-family`
   * @returns {Promise<IFamily>} Critter family.
   */
  const createFamily = async (label: string): Promise<IFamily> => {
    const { data } = await axios.post(`/api/critterbase/family/create`, { family_id: v4(), family_label: label });

    return data;
  };

  /**
   * Edit a family label.
   *
   * @async
   * @param {string} familyID - The id of the family.
   * @param {string} label - New family label. example: `caribou-2025-skeena-family-v2`
   * @returns {Promise<IFamily>} Critter family.
   */
  const editFamily = async (familyID: string, label: string) => {
    const { data } = await axios.patch(`/api/critterbase/family/${familyID}`, { family_label: label });

    return data;
  };

  /**
   * Create a child relationship under a family.
   * If family_label defined in payload this function will create a new family.
   *
   * @async
   * @param {CreateChildRelationship} payload - Critter child relationship update payload.
   * @returns {Promise<IFamilyChildResponse>} Critter child relationship.
   */
  const createChildRelationship = async (payload: CreateChildRelationship): Promise<IFamilyChildResponse> => {
    let familyID = payload.family_id;

    if (payload.family_label) {
      const family = await createFamily(payload.family_label);
      familyID = family.family_id;
    }
    const { data } = await axios.post(`/api/critterbase/family/children`, {
      ...payload,
      family_id: familyID
    });
    return data;
  };

  /**
   * Create a parent relationship under a family.
   * If family_label defined in payload this function will create a new family.
   *
   * @async
   * @param {CreateChildRelationship} payload - Critter parent relationship update payload.
   * @returns {Promise<IFamilyParentResponse>} Critter parent relationship.
   */
  const createParentRelationship = async (payload: CreateParentRelationship): Promise<IFamilyParentResponse> => {
    let familyID = payload.family_id;

    if (payload.family_label) {
      const family = await createFamily(payload.family_label);
      familyID = family.family_id;
    }
    const { data } = await axios.post(`/api/critterbase/family/parents`, {
      ...payload,
      family_id: familyID
    });
    return data;
  };

  /**
   * Delete a relationship (parent or child) of a family.
   *
   * @async
   * @param {*} params
   * @returns {Promise<IFamilyParentResponse | IFamilyChildResponse>} Either parent or child delete response.
   */
  const deleteRelationship = async (params: {
    relationship: AnimalRelationship;
    familyID: string;
    critterID: string;
  }): Promise<IFamilyParentResponse | IFamilyChildResponse> => {
    const payload =
      params.relationship === AnimalRelationship.CHILD
        ? { family_id: params.familyID, child_critter_id: params.critterID }
        : { family_id: params.familyID, parent_critter_id: params.critterID };

    const { data } = await axios.delete(`/api/critterbase/family/${params.relationship}`, { data: payload });

    return data;
  };

  return {
    getAllFamilies,
    getImmediateFamily,
    editFamily,
    deleteRelationship,
    createFamily,
    createChildRelationship,
    createParentRelationship
  };
};
