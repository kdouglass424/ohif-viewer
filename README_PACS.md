# PACS OHIF Viewer

## Sync upstream changes

```sh
git fetch upstream
git checkout upstream-mirror
git merge upstream/master
git push origin upstream-mirror

git checkout main
git merge upstream-mirror
git push origin main
```
