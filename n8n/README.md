# bcgov/biohubbc/n8n

Webhook and workflow automation tool used within our application.

## Documenation

N8N: https://docs.n8n.io/

## Running Locally

Within the n8n directory, there is a folder `credentials` which contains the encrypted credential details for webhook HTTP requests to use.
There is also the `workflows` directory which contains the workflow file(s). When a `make clean web` is run, these credentials and workflows are imported into n8n and can be called from within our app.

If a change needs to be made to the existing credentials/workflows or a new one needs to be added, this can be done from the browser in the local instance of n8n which is running at `http://localhost:5678`. When the changes have been made, make sure to save and then run the following command from the terminal/cmd line:

```
make n8n-export
```

This will export your changes and store them in the folders mentioned above so that next time a `clean web` command is issued, the appropriate latest credentials and workflows will be imported into n8n and the webhooks will work as expected.
