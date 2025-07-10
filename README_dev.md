## For making a version update

1. Update `<YY.MM.Release>` based versioning in `package.json`
2. Update version in `deploy/docker-compose.yaml` file
3. Make new docker image build and release using the command present on top of `./Dockerfile`
4. Make a new release with `/deploy` folder's .zip file
   > Run `npm run zip-release`
   > Make a release on Github with this .zip file
