# CI setup 

These setup instructions should only need to be done 1 time for this project to work. These docs exist as a reference in case there is something wrong with the CI server. 

### Create read/write access to Google Cloud Storage Bucket 

These instructions will allow GitHub Actions for this repository (`apple-code-signing`) to have read *and write* access to the Google Cloud Storage Bucket that stores all iOS code signing files for all iOS apps. This GitHub repository's GitHub Actions should be the only GitHub repository with *write* access to the Google Cloud Storage bucket. All other GitHub repositories (such as iOS SDK, React Native SDK, etc) will only have read-only access. View [create read-only access](#create-read-only-access-to-google-cloud-storage-bucket-for-other-ci-servers-to-use) section for how to set that up. 

1. First, let's find the Google Cloud Project (GCP) that is used for the iOS apps in the company. Go to the [Firebase Console](https://console.firebase.google.com/) > Select the Firebase project that the company uses to store the iOS sample apps. Next, navigate to the [Firebase project settings > Service accounts](https://console.firebase.google.com/project/_/settings/serviceaccounts/adminsdk) page. Click the button for "All service accounts" and it should navigate you away from Firebase and to the website `https://console.cloud.google.com`. When this webpage opens, you will notice a `project=X` value in the URL in your browser. That `X` is the project id for your GCP. Make sure that for all of the following instructions, you perform all steps for this GCP project ID and not another project. 

2. [Create a Google Cloud Storage Bucket](https://console.cloud.google.com/storage/browser) if it doesn't exist already. A bucket name such as `ios_code_signing_files` is recommended. 

3. [Create a new Google Cloud Service Account](https://console.cloud.google.com/iam-admin/serviceaccounts) if it doesn't exist already. A name `fastlane-match` is recommended. 

4. After you create the service account, copy the email address for the service account (probably looks like `fastlane-match@XXXXXX.iam.gserviceaccount.com`). You will need to use it in steps below. 

5. For the Service Account, select the "Keys" tab > Add key > Create new key > JSON > Create. This will download a `.json` file to your computer. Do not send this file to anyone, upload to cloud storage, upload to 1Password, or keep it on your computer. You will save the value in a future step and then you will delete all copies of this file. 

6. Open the GCP Storage Bucket created > Permissions tab. Select *Grant Access* > put the Service Account email address in "New principals" > Assign roles add *Storage Bucket Owner* and *Storage Object Owner* > Save. 

This gives the Service Account read and write access to the Storage Bucket. 

7. Remember that `.json` file that got saved to your computer in a previous step? Let's say that you saved this `.json` file to `/tmp/service-account-file.json` on your computer. You will use this file in the next steps. 

[Create a secret for GitHub Actions](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository) in *this* GitHub repository. The `apple-code-signing` GitHub project is the only project with write access to the GCP Storage Bucket and therefore, only set the GitHub Actions secret for this `apple-code-signing` GitHub repository. 

The key for the secret is `GOOGLE_CLOUD_MATCH_WRITE_SERVICE_ACCOUNT_B64`. 
Get the value for the secret from running this command: `cat /tmp/service-account-file.json | base64`

8. Done! All of the files in this project will use the secret you just saved in order to have write access to the GCP Storage Bucket. Remember to now delete the file `/tmp/service-account-file.json` from your computer and make sure it's not saved anywhere else such as cloud hosting or 1Password. If anyone in the future needs the contents of this file, they will be instructed to instead generate a new Service Account key file and upload the new value to GitHub Actions secrets. 

### Create read-only access to Google Cloud Storage Bucket for other CI servers to use 

The GitHub repository for this project (`apple-code-signing`) is the *only* GitHub repository that has write access to iOS code signing files. What about all of the other GitHub repositories in the company such as the iOS SDK or React Native SDK? Those GitHub repositories need to compile iOS apps and sign those apps. This section talks about how to setup all iOS GitHub repositories in the company to be able to build and sign iOS apps. 

The instructions in this setting are almost identical to the section [that sets up *write* access in a GitHub repository](#create-readwrite-access-to-google-cloud-storage-bucket). Therefore, you are encourage to follow all of those steps in that section with the following modifications to the matching step: 

3. Create a Service Account if it does not exist already with the recommended name `fastlane-match-readonly`. 

6. *Grant Access* to the GCP Storage Bucket for the `fastlane-match-readonly` Service Account you created. Assign the roles *Storage Bucket Reader* and *Storage Object Reader*. This is important - make sure the roles are *Reader* and *not* *Owner*. 

7. You will create a GitHub Actions secret but the secret key is `GOOGLE_CLOUD_MATCH_READONLY_SERVICE_ACCOUNT_B64`. 

It's recommended that you go ahead and enter this secret value in *all* GitHub repositories that might build an iOS app in the future. This is because you will be deleting the Service Account `.json` file, you might as well save this value to all GitHub repositories before you delete the file from your computer. 

### Authenticate with Apple Developer Account

These instructions will allow GitHub Actions for this repository (`apple-code-signing`) to have *write* access to the company Apple Developer account to be able to create and delete iOS code signing files. This repository will use the App Store Connect API to communicate with Apple to perform these actions.

1. Follow [these docs](https://docs.fastlane.tools/app-store-connect-api/) for instructions on how to create this API key. For permissions, use *App Manager*. 

When you create these new credentials, the Apple website will prompt you to save a `.p8` file to your computer. Do not send this file to anyone, upload to cloud storage, upload to 1Password, or keep it on your computer. You will save the value in a future step and then you will delete all copies of this file. 

Also on this screen, notice that there is a `App id` and `Issuer id`. You will reference both of these files in future steps. 

2. On your computer, you will be creating a `.json` file that looks similar to this: 

```json
{
  "key_id": "D383SF739",
  "issuer_id": "6053b7fe-68a8-4acb-89be-165aa6465141",
  "key": "MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHknlhdlYdLu",
  "in_house": false
}
```

Using your favorite text editor on your computer, create a new file and save the blank file on your computer. Let's say that you saved this `.json` file to `/tmp/apple_api_credentials.json` on your computer. In your text editor, copy and paste the above `.json` sample. 

Time to modify each of the values in this `.json` file. 

* `in_house` is `true` if [you have an Enterprise Apple Developer Account](https://stackoverflow.com/a/39741405). Otherwise, set to `false`. 
* `key_id` and `issuer_id` are the values that you found when you created the API key on the Apple Developer account website. 
* For `key`, you need the `.p8` file downloaded to your computer that Apple gave you when you created the API key. Run `cat /tmp/apple_api_credentials.p8 | base64` to get a base64 encoded string of the `.p8` file contents. This string that gets printed in your terminal is the value of `key` in the `.json` file. 

3. Now that you have populated all of the fields of the `.json` file, there is one last step. 

[Create a secret for GitHub Actions](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository) in *this* GitHub repository. The `apple-code-signing` GitHub project is the only project with write access to the Apple Developer account and therefore, only set the GitHub Actions secret for this `apple-code-signing` GitHub repository. 

The key for the secret is `APP_STORE_CONNECT_API_KEY_CONTENT_B64`. 
Get the value for the secret from running this command: `cat /tmp/apple_api_credentials.json | base64`

4. Done! All of the files in this project will use the secret you just saved in order to have write access to the Apple Developer account. Remember to now delete the file `/tmp/apple_api_credentials.json` from your computer and make sure it's not saved anywhere else such as cloud hosting or 1Password. If anyone in the future needs the contents of this file, they will be instructed to instead generate a new API key file and upload the new value to GitHub Actions secrets. 

### Authenticate with Slack to sending messages on code signing maintenance 

[Create a secret for GitHub Actions in the GitHub repository](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository). 

The key for the secret is `SLACK_NOTIFY_WEBHOOK_URL`. 
Get the value from 1Password "Mobile squad Slack incoming webhook URL". 
