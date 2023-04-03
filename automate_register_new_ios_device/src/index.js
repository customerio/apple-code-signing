const {
  onNewTesterIosDevicePublished,
} = require("firebase-functions/v2/alerts/appDistribution");
const http = require("node-fetch");

// This function gets called automatically by Firebase when a new test device is added to App Distribution for this Firebase Project. 
// To automate adding this new iOS device to our company's Apple Developer account, we will trigger the CI server for this GitHub repository which is setup 
// to automate registering new devices, building iOS apps, and re-create code signing. 
exports.registerNewDeviceAdded = onNewTesterIosDevicePublished({secrets: ["GITHUB_API_KEY_TRIGGER_CI_SERVER_REGISTER_NEW_TOKEN"]}, async (event) => {
  const appId = event.appId;
  const {
    testerDeviceIdentifier,
    testerDeviceModelName,
    testerEmail,
    testerName,
  } = event.data.payload;
  const githubApiKeyToTriggerCIServer = process.env.GITHUB_API_KEY_TRIGGER_CI_SERVER_REGISTER_NEW_TOKEN;

  if (!githubApiKeyToTriggerCIServer) {
    throw new Error(`Forgot to set GITHUB_API_KEY_TRIGGER_CI_SERVER_REGISTER_NEW_TOKEN secret to authenticate with GitHub to run CI server. Add a value for this secret, then try running again. https://firebase.google.com/docs/functions/config-env#create-secret`);
  }
  
  // https://docs.github.com/en/rest/actions/workflows?apiVersion=2022-11-28#create-a-workflow-dispatch-event
  await http("https://api.github.com/repos/customerio/apple-code-signing/actions/workflows/register-new-device.yml/dispatches", {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${githubApiKeyToTriggerCIServer}`
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({
      ref: "main", // name of the branch where the workflow file exists that we want to run. 
      inputs: {
        ios_device_udid: testerDeviceIdentifier,
        device_model_name: testerDeviceModelName,
        device_tester_email: testerEmail
      }
    })
  });
};