# Automate registering new iOS devices to company Apple Developer account 

TODO give flow for what needs to happen to get a new tester added to an iOS build 

# Node version 

[Firebase functions needs to support the node version that is specified by this code base](https://firebase.google.com/docs/functions/get-started?gen=2nd#set-up-your-environment-and-the-firebase-cli). 

After you decide a version of node to use (example: `18`), follow these steps: 
1. Update `.nvmrc` with that major version number. Remember to run `nvm use` on your development machine to begin using that node version. 
2. Update `engines` in `package.json` with that version. 