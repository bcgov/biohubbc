# Setup S3 Browser

S3 Browser is what we recommend windows users setup for connecting to the BCGov Object Store (S3 Compatible) storage and viewing files uploaded by SIMS.

1. Download [S3 Browser](https://s3browser.com/)
2. Add account to connect to S3 bucket
3. Update account type to be: `S3 Compatible Storage`
4. Go to OpenShift environment

[Open Shift Secrets](./images/templates/open%20shift%20secrets.png)

6. Search for object-store
7. Copy object_url, access_key and secret key into S3 Bucket fields

[S3 New Account](./images/templates/s3%20setup.png)

8. Create account and connect
