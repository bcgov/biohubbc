# Schemas

## Whats the difference between [OpenAPI](https://swagger.io/specification/) and [JSON-Schema](https://json-schema.org/)?

OpenAPI and JSON-SChema are identical in many ways, but in general:

- OpenAPI is interested in defining the entire API
  - server urls
  - server meta information
  - routes
  - requests
  - responses
- JSON-Schema is really only interested in defining JSON objects
  - requests
  - responses

For a detailed breakdown of the ven-diagram like relationship these 2 schemas have, see: https://swagger.io/docs/specification/data-models/keywords/

## How are OpenAPI and JSON-Schema being used in BioHub?

The API is defined using the OpenAPI specification.

JSON-Schema is only used to define the data_templates, which are leveraged by the Frontend to render forms (using [RJSF](react-jsonschema-form.readthedocs.io)).

- Note: This only describes the data_template value, not the template related api endpoints.
