# apple-code-signing

Automating code signing maintenance for all of our iOS apps at Customer.io 

# How to use 

This project does 2 things: It creates new code signing files for new apps and it performs scheduled maintenance of all code signing files for all iOS apps for the entire company. 

The following sections goes into each of these tasks in more detail. 

## Creating a new iOS app? 

All iOS apps need to be registered with Apple through an [Apple Developer account](https://developer.apple.com/account/). You should have an Apple Developer account already with your `@customer.io` email address. With that account, let's go through the steps to create a new iOS app. 

* **Register a new App ID** 

Following [these instructions](https://developer.apple.com/help/account/manage-identifiers/register-an-app-id), create a new app in the company's Apple Developer account for this new iOS app. 

For the bundle ID, have it start with `io.customer`. Make sure that this new bundle ID is unique not sharing the same bundle ID as any other bundle ID in the company's Apple Developer account. View [the list of bundle IDs](https://developer.apple.com/account/resources/identifiers/list) for ideas and to make sure the new bundle ID is unique. 

When asked about making a *Wildcard App ID*, do not select it. All app IDs should not be a wildcard as wildcards do not allow some features to be added to an iOS app. 

When asked about what capabilities to add, you can select the *Push notifications* checkbox since your app will probably be using push notifications. You can keep all other checkboxes unchecked for now. You can modify capabilities at anytime for existing apps. 

* **Create code signing files for the new App ID**

This project is setup with a CI server that creates code signing files for all iOS apps in the company's Apple Developer account. [Go to this webpage](https://github.com/customerio/apple-code-signing/actions/workflows/create-code-signing-files.yml) and run the workflow. The script will see the new app id that you created and will create code signing files for the new app. 

* **Download the newly created code signing files to your development machine**

TODO. I need to test this out without gc_keys.json file 

* **Open your new iOS app in Xcode**

Follow the instructions in this screenshot to select the correct code signing files for this app: 

![](img/xcode_disable_auto_signing.png)

After you change these settings, you should not see any errors in Xcode:

![](img/check_errors_signing_xcode.png)

## Maintenance of code signing files 

Code signing Apple apps consists of 2 types of files: certificates and provisioning profiles. Both of these files have an expiration date and they need to be deleted and re-created. 

For provisioning profiles, these are easy to handle when they expire because re-creating a new provisioning profile only impacts 1 single Apple app. 

Certificates, however, are more impactful because *all* provisioning profiles for *all* Apple apps are created from 1 certificate. When you delete a certificate, you also need to re-create all provisioning profiles for every all Apple apps you have. 

This project is setup to automatically delete code signing certificates before they expire to avoid downtime in building iOS apps. See `./.github/workflows/delete-code-signing-files.yml` for this logic. 

# CI setup 

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

Once you create this API key, Apple will not show it to you again. Security save the key id, issuer id, and key that Apple generated for you. You will be referencing all of this information later. 

* **Create a JSON file that contains this new API key**

Follow [these docs](https://docs.fastlane.tools/app-store-connect-api/) for instructions on how to create a `.json` file similar to this: 

```json
{
  "key_id": "D383SF739",
  "issuer_id": "6053b7fe-68a8-4acb-89be-165aa6465141",
  "key": "-----BEGIN PRIVATE KEY-----\nMIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHknlhdlYdLu\n-----END PRIVATE KEY-----",
  "in_house": false
}
```

`in_house` is `true` if [you have an Enterprise Apple Developer Account](https://stackoverflow.com/a/39741405). Otherwise, set to `false`. 

`key_id`, `issuer_id`, and `key` are all values that were given to you when you created an API key in the previous step. For `key` value, you will take the contents of the `.p8` file and replace all newlines with a newline character (`\n`) until the `.p8` file contents are a 1 line string. 

Let's say that you saved this `.json` file to `/tmp/apple_api_credentials.json` on your computer. You will use this file in the next steps. 

* **Set secret in GitHub**

[Create a secret for GitHub Actions in the GitHub repository](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository). 

The key for the secret is `APP_STORE_CONNECT_API_KEY_CONTENT_B64`. 
Get the value for the secret from running this command: `cat /tmp/apple_api_credentials.json | base64`


