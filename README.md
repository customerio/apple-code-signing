# apple-code-signing

Automating code signing maintenance for all of our iOS apps at Customer.io 

# Features 

## Automating code signing certificates expiring 

Code signing Apple apps consists of 2 types of files: certificates and provisioning profiles. Both of these files have an expiration date and they need to be deleted and re-created. 

For provisioning profiles, these are easy to handle when they expire because re-creating a new provisioning profile only impacts 1 single Apple app. 

Certificates, however, are more impactful because *all* provisioning profiles for *all* Apple apps are created from 1 certificate. When you delete a certificate, you also need to re-create all provisioning profiles for every all Apple apps you have. 

This project is setup to automatically delete code signing certificates before they expire to avoid downtime in building iOS apps. See `./.github/workflows/delete-code-signing-files.yml` for this logic. 