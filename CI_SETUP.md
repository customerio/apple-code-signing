# CI setup 

Setup should only need to be done 1 time for this project to work. These docs exist as a reference in case there is something wrong with the CI server. 

### Authenticate with Google Cloud Storage Bucket 

How the CI server will authenticate with a Google Cloud Storage Bucket. The CI server may create or delete code signing files from this bucket. 

* **Create a json file used to access the storage bucket**

For Customer.io employees, this file may have already been created that you can reference (probably called `gc_keys.json`). 

Otherwise, you will need to create this file. According to [these docs](https://docs.fastlane.tools/actions/match/), the easiest way to create this file is through running `fastlane match init` and it will walk you through creating file. 

Your objective is to:
1. Create a new Google Cloud Storage Bucket. This new bucket will be used to store code signing files for *all* iOS apps in your entire Apple developer account. Do not create a new bucket for each iOS app in your account. 
2. Add a Google Cloud Service Account to this bucket. The service account should have permissions `Storage Admin` to this bucket. Create a authentication key for this service account (`json` format) and save the `json` file to your computer. 

Let's say that you saved this `.json` file to `/tmp/gc_keys.json` on your computer. You will use this file in the next steps. 

* **Set secret in GitHub**

[Create a secret for GitHub Actions in the GitHub repository](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository). 

The key for the secret is `GOOGLE_CLOUD_AUTH_FILE_CONTENTS_B64`. 
Get the value for the secret from running this command: `cat /tmp/gc_keys.json | base64`

### Authenticate with Apple Developer Account

How the CI server will authenticate with your Apple Developer Account to delete and create code signing files. 

* **Create an API key for your Apple Developer Account**

For Customer.io employees, this API key may have already been created that you can reference. Otherwise, follow [these docs](https://docs.fastlane.tools/app-store-connect-api/) for instructions on how to create this API key. 

Once you create this API key, Apple will not show it to you again. Security save the key id, issuer id, and key (p8 file) that Apple generated for you. You will be referencing all of this information later. 

* **Create a JSON file that contains this new API key**

Follow [these docs](https://docs.fastlane.tools/app-store-connect-api/) for instructions on how to create a `.json` file similar to this: 

```json
{
  "key_id": "D383SF739",
  "issuer_id": "6053b7fe-68a8-4acb-89be-165aa6465141",
  "key": "MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHknlhdlYdLu",
  "in_house": false
}
```

`in_house` is `true` if [you have an Enterprise Apple Developer Account](https://stackoverflow.com/a/39741405). Otherwise, set to `false`. 

`key_id`, `issuer_id`, and `key` are all values that were given to you when you created an API key in the previous step. `key_id` and `issuer_id` values are simply the values that Apple gave you directly. 

For `key` value, you need the `.p8` file downloaded to your computer that Apple gave you when you created the API key. Let's say that you have the `.p8` file saved to the location: `/tmp/apple_key.p8` on your computer. Run `cat /tmp/apple_key.p8 | base64` to get a base64 encoded string of the `.p8` file contents. This string that gets printed in your terminal is the value of `key` in the `.json` file. 

Now that you have populated all of the fields of the `.json` file, there is one last step. Let's say that you saved this `.json` file to `/tmp/apple_api_credentials.json` on your computer. You will use this file in the next steps. 

* **Set secret in GitHub**

[Create a secret for GitHub Actions in the GitHub repository](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository). 

The key for the secret is `APP_STORE_CONNECT_API_KEY_CONTENT_B64`. 
Get the value for the secret from running this command: `cat /tmp/apple_api_credentials.json | base64`

### Authenticate with Slack to sending messages on code signing maintenance 

[Create a secret for GitHub Actions in the GitHub repository](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository). 

The key for the secret is `SLACK_NOTIFY_WEBHOOK_URL`. 
Get the value from 1Password "Mobile squad Slack incoming webhook URL". 
