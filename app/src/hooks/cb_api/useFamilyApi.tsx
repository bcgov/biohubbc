import { AxiosInstance } from 'axios';
import { AnimalRelationship } from 'features/surveys/view/survey-animals/animal';
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

type CreateFamilyRelationshipPayload = {
  relationship: AnimalRelationship;
  family_label?: string;
  family_id?: string;
  critter_id: string;
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
   * @param {string} family_id - The id of the family.
   * @param {string} label - New family label. example: `caribou-2025-skeena-family-v2`
   * @returns {Promise<IFamily>} Critter family.
   */
  const editFamily = async (family_id: string, label: string) => {
    const { data } = await axios.patch(`/api/critterbase/family/${family_id}`, { family_label: label });

    return data;
  };

  /**
   * Create (parent or child) relationship of a family.
   *
   * @async
   * @param {CreateFamilyRelationshipPayload} payload - Create relationship payload.
   * @returns {Promise<IFamilyParentResponse | IFamilyChildResponse>}
   */
  const createFamilyRelationship = async (
    payload: CreateFamilyRelationshipPayload
  ): Promise<IFamilyParentResponse | IFamilyChildResponse> => {
    if (payload.relationship === AnimalRelationship.CHILD) {
      const { data } = await axios.post(`/api/critterbase/family/children`, {
        family_id: payload.family_id,
        child_critter_id: payload.critter_id
      });

      return data;
    }

    const { data } = await axios.post(`/api/critterbase/family/parents`, {
      family_id: payload.family_id,
      parent_critter_id: payload.critter_id
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
    family_id: string;
    critter_id: string;
  }): Promise<IFamilyParentResponse | IFamilyChildResponse> => {
    const payload =
      params.relationship === AnimalRelationship.CHILD
        ? { family_id: params.family_id, child_critter_id: params.critter_id }
        : { family_id: params.family_id, parent_critter_id: params.critter_id };

    const { data } = await axios.delete(`/api/critterbase/family/${params.relationship}`, { data: payload });

    return data;
  };

  return {
    getAllFamilies,
    getImmediateFamily,
    editFamily,
    deleteRelationship,
    createFamily,
    createFamilyRelationship
  };
};
