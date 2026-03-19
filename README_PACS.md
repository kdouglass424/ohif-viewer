# PACS OHIF Viewer

## Getting started

Refer to the [devcontainer README](.devcontainer/README.md) to set up your local dev environment.

## Sync upstream changes

Git commands to sync upstream changes with **OHIF/Viewer**.

```sh
git fetch upstream
git checkout upstream-mirror
git merge upstream/master
git push origin upstream-mirror

git checkout main
git merge upstream-mirror
git push origin main
```
