import { IDetailedCritterWithInternalId } from 'interfaces/useSurveyApi.interface';
import { v4 } from 'uuid';
import { AnimalSex, Critter, IAnimal, newFamilyIdPlaceholder } from './animal';

/**
 * Takes the 'detailed' format response from the Critterbase DB and transforms the response into an object that is usable
 * in the Formik form. Primary keys are included despite not being editable in the form to make it easier to differentitate between new and existing
 * form entries on submission.
 *
 * @param existingCritter The critter as seen from the Critterbase DB
 * @returns {*} IAnimal
 */
export const transformCritterbaseAPIResponseToForm = (existingCritter: IDetailedCritterWithInternalId): IAnimal => {
  //This is a pretty long albeit straightforward function, which is why it's been lifted out of the main TSX file.
  //Perhaps some of this could be automated by iterating through each object entries, but I don't think
  //it's necessarily a bad thing to have it this explicit when so many parts need to be handled in particular ways.
  return {
    general: {
      wlh_id: existingCritter.wlh_id ?? '',
      itis_tsn: existingCritter.itis_tsn,
      animal_id: existingCritter.animal_id ?? '',
      sex: existingCritter.sex as AnimalSex,
      itis_scientific_name: existingCritter.itis_scientific_name,
      critter_id: existingCritter.critter_id
    },
    captures: existingCritter?.captures.map((cap) => ({
      ...cap,
      capture_comment: cap.capture_comment ?? '',
      release_comment: cap.release_comment ?? '',
      capture_timestamp: new Date(cap.capture_timestamp),
      release_timestamp: cap.release_timestamp ? new Date(cap.release_timestamp) : undefined,
      capture_latitude: cap.capture_location?.latitude,
      capture_longitude: cap.capture_location?.longitude,
      capture_coordinate_uncertainty: cap.capture_location?.coordinate_uncertainty ?? 0,
      release_longitude: cap.release_location?.longitude,
      release_latitude: cap.release_location?.latitude,
      release_coordinate_uncertainty: cap.release_location?.coordinate_uncertainty ?? 0,
      capture_utm_northing: 0,
      capture_utm_easting: 0,
      release_utm_easting: 0,
      release_utm_northing: 0,
      projection_mode: 'wgs',
      show_release: !!cap.release_location,
      capture_location_id: cap.capture_location_id ?? undefined,
      release_location_id: cap.release_location_id ?? undefined
    })),
    mortality: [],
    markings: existingCritter?.markings.map((mark) => ({
      ...mark,
      primary_colour_id: mark.primary_colour_id ?? '',
      secondary_colour_id: mark.secondary_colour_id ?? '',
      marking_comment: mark.comment ?? '',
      primary_colour: mark.primary_colour ?? undefined,
      marking_type: mark.marking_type ?? undefined,
      body_location: mark.body_location ?? undefined
    })),
    // mortality: existingCritter?.mortality.map((mor) => ({
    //   ...mor,
    //   mortality_comment: mor.mortality_comment ?? '',
    //   mortality_timestamp: new Date(mor.mortality_timestamp),
    //   mortality_latitude: mor.location.latitude,
    //   mortality_longitude: mor.location.longitude,
    //   mortality_utm_easting: 0,
    //   mortality_utm_northing: 0,
    //   mortality_coordinate_uncertainty: mor.location.coordinate_uncertainty ?? 0,
    //   proximate_cause_of_death_confidence: mor.proximate_cause_of_death_confidence,
    //   proximate_cause_of_death_id: mor.proximate_cause_of_death_id ?? '',
    //   proximate_predated_by_itis_tsn: mor.proximate_predated_by_itis_tsn ?? '',
    //   ultimate_cause_of_death_confidence: mor.ultimate_cause_of_death_confidence ?? '',
    //   ultimate_cause_of_death_id: mor.ultimate_cause_of_death_id ?? '',
    //   ultimate_predated_by_itis_tsn: mor.ultimate_predated_by_itis_tsn ?? '',
    //   projection_mode: 'wgs',
    //   location_id: mor.location_id ?? undefined
    // })),
    collectionUnits: existingCritter.collection_units,
    measurements: [
      ...existingCritter.measurements.qualitative.map((meas) => ({
        ...meas,
        measurement_quantitative_id: undefined,
        value: undefined,
        measured_timestamp: meas.measured_timestamp ? new Date(meas.measured_timestamp) : ('' as unknown as Date),
        measurement_comment: meas.measurement_comment ?? '',
        measurement_name: meas.measurement_name ?? undefined,
        option_label: meas.option_label
      })),
      ...existingCritter.measurements.quantitative.map((meas) => ({
        ...meas,
        measurement_qualitative_id: undefined,
        qualitative_option_id: undefined,
        measured_timestamp: meas.measured_timestamp ? new Date(meas.measured_timestamp) : ('' as unknown as Date),
        measurement_comment: meas.measurement_comment ?? '',
        measurement_name: meas.measurement_name ?? undefined,
        option_label: undefined
      }))
    ],
    family: [
      ...existingCritter.family_child.map((ch) => ({
        family_id: ch.family_id,
        relationship: 'child'
      })),
      ...existingCritter.family_parent.map((par) => ({
        family_id: par.family_id,
        relationship: 'parent'
      }))
    ],
    images: [],
    device: []
  };
};

/**
 * This yields the difference between array 1 and array 2, specifically which items array 1 has
 * that array 2 does not. Argument order matters here, does not function like a true 'set difference.'
 *
 * @param arr1 First array
 * @param arr2 Second array
 * @param key A key present in objects from both arrays
 * @returns {*} subset of T[]
 */
export const arrDiff = <T extends Record<K, any>, V extends Record<K, any>, K extends keyof T & keyof V>(
  arr1: T[],
  arr2: V[],
  key: K
) => {
  return arr1.filter((a1: Record<K, any>) => !arr2.some((a2: Record<K, any>) => a1[key] === a2[key]));
};

interface CritterUpdatePayload {
  create: Critter;
  update: Critter;
}

/**
 * Returns two payload objects, one of which is for entries that should be newly created in the DB, the other should patch over
 * or delete existing rows.
 *
 * @param initialFormValues IAnimal
 * @param currentFormValues IAnimal
 * @returns {*} CritterUpdatePayload
 */
export const createCritterUpdatePayload = (
  initialFormValues: IAnimal,
  currentFormValues: IAnimal
): CritterUpdatePayload => {
  const initialCritter = new Critter(initialFormValues);
  //First we filter all parts of the form which do not have the primary key from CB nested in them.
  //These had to have been created by the user and not autofilled by existing data, so we create these in CB.
  const createCritter = new Critter({
    ...currentFormValues,
    captures: currentFormValues.captures.filter((a) => !a.capture_id),
    mortality: currentFormValues.mortality.filter((a) => !a.mortality_id),
    markings: currentFormValues.markings.filter((a) => !a.marking_id),
    measurements: currentFormValues.measurements.filter(
      (a) => !a.measurement_qualitative_id && !a.measurement_quantitative_id
    ),
    collectionUnits: currentFormValues.collectionUnits.filter((a) => !a.critter_collection_unit_id),
    family: []
  });
  //Now we do the opposite operation. If the primary key was included in the object, it must have come from Critterbase.
  //The user is unable to edit the primary key using the form fields.
  const updateCritter = new Critter({
    ...currentFormValues,
    captures: currentFormValues.captures.filter((a) => a.capture_id),
    mortality: currentFormValues.mortality.filter((a) => a.mortality_id),
    markings: currentFormValues.markings.filter((a) => a.marking_id),
    measurements: currentFormValues.measurements.filter(
      (a) => a.measurement_qualitative_id || a.measurement_quantitative_id
    ),
    collectionUnits: currentFormValues.collectionUnits.filter((a) => a.critter_collection_unit_id),
    family: []
  });

  //Family section is a bit of a special case. A true update operation is unsupported, since it doesn't really make sense
  //for the various family schemas.
  //Therefore, any "updated" entries have their previously existing selves deleted.
  //Here we determine this by searching all initial form values and seeing which ones didn't make it into the final form values.
  initialFormValues.family.forEach((prevFam) => {
    if (
      !currentFormValues.family.some(
        (currFam) => currFam.family_id === prevFam.family_id && currFam.relationship === prevFam.relationship
      )
    ) {
      prevFam.relationship === 'parent'
        ? updateCritter.families.parents.push({
            family_id: prevFam.family_id,
            parent_critter_id: initialCritter.critter_id,
            _delete: true
          })
        : updateCritter.families.children.push({
            family_id: prevFam.family_id,
            child_critter_id: initialCritter.critter_id,
            _delete: true
          });
    }
  });

  //Now we do the inverse, see which records were not in the initial form, those are the ones that need to be created.
  //Perhaps this could be rolled into the above? I couldn't seem to find a way that wouldn't miss certain cases.
  currentFormValues.family.forEach((currFam) => {
    if (
      !initialFormValues.family.some(
        (prevFam) => currFam.family_id === prevFam.family_id && currFam.relationship === prevFam.relationship
      )
    ) {
      let familyId = currFam.family_id;
      if (currFam.family_id === newFamilyIdPlaceholder) {
        familyId = v4();
        createCritter.families.families.push({
          family_id: familyId,
          family_label: `${currentFormValues.general.animal_id}-${currentFormValues.general.itis_scientific_name}_family`
        });
      }
      currFam.relationship === 'parent'
        ? createCritter.families.parents.push({
            family_id: familyId,
            parent_critter_id: initialCritter.critter_id
          })
        : createCritter.families.children.push({
            family_id: familyId,
            child_critter_id: initialCritter.critter_id
          });
    }
  });

  //Here we check for which entries were removed for all other sections in the final form submission.
  //See arrDiff's doc for what it's doing here.
  //Again, it would be nice if this could be rolled into the create / update differentiation somehow, but I don't think it's possible.
  updateCritter.captures.push(
    ...arrDiff(initialCritter.captures, updateCritter.captures, 'capture_id').map((cap) => ({
      ...cap,
      _delete: true
    }))
  );
  updateCritter.mortalities.push(
    ...arrDiff(initialCritter.mortalities, updateCritter.mortalities, 'mortality_id').map((mort) => ({
      ...mort,
      _delete: true
    }))
  );
  updateCritter.collections.push(
    ...arrDiff(initialCritter.collections, updateCritter.collections, 'critter_collection_unit_id').map((col) => ({
      ...col,
      _delete: true
    }))
  );
  updateCritter.markings.push(
    ...arrDiff(initialCritter.markings, updateCritter.markings, 'marking_id').map((mark) => ({
      ...mark,
      _delete: true
    }))
  );
  updateCritter.measurements.qualitative.push(
    ...arrDiff(
      initialCritter.measurements.qualitative,
      updateCritter.measurements.qualitative,
      'measurement_qualitative_id'
    ).map((meas) => ({ ...meas, _delete: true }))
  );
  updateCritter.measurements.quantitative.push(
    ...arrDiff(
      initialCritter.measurements.quantitative,
      updateCritter.measurements.quantitative,
      'measurement_quantitative_id'
    ).map((meas) => ({ ...meas, _delete: true }))
  );

  return { create: createCritter, update: updateCritter };
};
