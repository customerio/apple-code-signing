const {
  onNewTesterIosDevicePublished,
} = require("firebase-functions/v2/alerts/appDistribution");
const { Octokit } = require("@octokit/rest");

// This function gets called Firebase when a new test device is added to App Distribution for this Firebase Project. 
exports.registernewdeviceadded = onNewTesterIosDevicePublished(
  // register a secret that the function can reference. Used to authenticate with GitHub to run CI server.
  // docs: https://firebase.google.com/docs/functions/config-env#create-secret
  {secrets: ["GITHUB_API_KEY_TRIGGER_CI_SERVER_REGISTER_NEW_TOKEN"]}, 
async (event) => {
  // event.data.payload is the data that was published to App Distribution when a new tester device was added.
  // pull out the parts that we care about to pass to the CI server.  
  const {
    testerDeviceIdentifier,
    testerDeviceModelName,
    testerEmail
  } = event.data.payload;

  // get the secret that we registered with Firebase. This is the GitHub API key that we use to authenticate with GitHub to run the CI server.
  const githubApiKeyToTriggerCIServer = process.env.GITHUB_API_KEY_TRIGGER_CI_SERVER_REGISTER_NEW_TOKEN;
  if (!githubApiKeyToTriggerCIServer) {
    throw new Error(`Forgot to set GITHUB_API_KEY_TRIGGER_CI_SERVER_REGISTER_NEW_TOKEN secret.`);
  }

  // Create instance of Octokit, the GitHub API client. Easy way for us to use the GitHub API and stay up-to-date with future GitHub API changes by just updating this library. 
  const octokit = new Octokit({
    auth: githubApiKeyToTriggerCIServer,
  })

  // Trigger the CI server to register a new device. We pass the CI job the data that we pulled out of the App Distribution event.
  await octokit.rest.actions.createWorkflowDispatch({
    owner: "customerio",
    repo: "apple-code-signing",
    workflow_id: "register-new-device.yml",
    ref: "main",
    inputs: {
      ios_device_udid: testerDeviceIdentifier,
      device_model_name: testerDeviceModelName,
      device_tester_email: testerEmail
    }
  });
});