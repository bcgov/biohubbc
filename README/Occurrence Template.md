# _NOTE: NEEDS UPDATING_

# BioHub Templates

## Observation Templates

## Adding a new template

1. Get the summary template from Confluence BioHub BC & SIMS -> Data and Standards -> SIMS Templates
2. Use the examples in the folder below to create a new validation object:

```
biohubbc/database/src/migrations/template_methodology_species_validations/new_template.ts
```

3. Add any new `Picklist Values` to:

```
biohubbc/database/src/template_methodology_species_validations/picklist_variables/v0.2.ts
```

4. Create a migration for the new template validation object. Use previous template migrations as examples to get started. Your migration file name should start with a timestamp in the format: YYYYMMDDHHmmss

```
biohubbc/database/src/migrations/YYYYMMDDHHmmss_new_migration.ts
```

5. Run make commands to migrate the database.

```
// run database setup and check the logs
make db-setup
make log-db-setup
```

If the migration fails for any reason, make your changes and re-run the process

```
// cleans the existing DB and rebuilds it
make clean db-setup
make log-db-setup
```

A successful migration will look something like this

![Successful Migration](./images/templates/successful%20migration.png)

6. Update Template Properties with `sims_template_id` and `sims_csm_id` values. These are required so the system can find the correct template to validate with.

   1. Open the template in excel
   2. Navigate to File tab in the ribbon
   3. Then select Info -> Properties -> Advanced Properties
      ![Advanced Properties](./images/templates/advanced%20properties.png)

   4. In the new panel navigate to the Custom tab

      ![Custom Tab](./images/templates/custom%20tab.png)

   5. Add `sims_template_id`. This values comes from `template_id` in the `template_methodology_species` table
   6. Add `sims_csm_id`. This values comes from `field_method_id` in the `template_methodology_species` table

7. Add tempalte to resource page in SIMS (BioHub)

```
biohubbc/app/src/resources/ResourcesPage.tsx
```

8. [Connect](./S3%20Browser.md) and add file to S3 Bucket templates folder
9. Update original template in confluence if anything has changed (fixed fields, spelling, worksheet names ect.)
