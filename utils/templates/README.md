# Template Config Builders

This folder contains some scripts that can be used to assist in the creation of validation and/or transformation configs.

Why? Both the validation and transformation configs are large JSON objects, which can be tedious to create without the help of re-usable typescript functions that can reduce teh manual effort needed to produce the JSON objects.

# Template Validation Config Builder

### Follow these steps to create a validation configuration for an excel template

1. Download template and associated attribute description. Ensure this is at least v2.0 of the file. These can be found here: [Templates](https://apps.nrs.gov.bc.ca/int/confluence/x/kKSeB)

2. Start constructing the validation in the `templateValidationSchema` object based on the rules and data types in the previously downloaded  
   a. There are a few helper functions in the `template_to_file` for speeding things up like numeric validation.

3. Two properties will need to be added to the template file for the validations to work in the system. Open the template  
   a. Once open, select File  
   b. Select Info (left hand side)  
   c. Open properties dropdown (Right hand side)  
   d. Select Advanced Properties  
   e. Open Custom tab  
   f. Add `sims_name` with the name found in the far left column where you downloaded the template from  
   g. Add `sims_version` with the same version of the file downloaded

4. Once the schema is complete run the command `npm template-to-file`. This will turn your new object into the raw JSON in the `template_output.json` file

5. Refer to the setup steps detailed in confluence here: [Template+Migration](https://apps.nrs.gov.bc.ca/int/confluence/x/dYK6C)  
   a. The template name and description are the `sims_name` filled out earlier  
   b. The validation schema in the SQL is the contents of `template_output.json`

6. Once the SQL has been run your template is ready to test with data.

7. Update the `Validation JSON` column found here: [Templates](https://apps.nrs.gov.bc.ca/int/confluence/x/kKSeB) with the contents of `template_to_file.ts`

8. Update the `Validation Schema` column found here: [Templates](https://apps.nrs.gov.bc.ca/int/confluence/x/kKSeB) with the contents of the `template_output.json`

### Helpful resources

- https://apps.nrs.gov.bc.ca/int/confluence/x/kKSeB
- https://apps.nrs.gov.bc.ca/int/confluence/x/dYK6C

# Template Transformation Config Builder

### Follow these steps to create a transformation configuration for an excel template

TBD