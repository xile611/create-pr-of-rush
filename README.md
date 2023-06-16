# Collect changelog of rush

## useage

### examples

- Case 1: read the version from './package.json'

```
name: your workflow

on: push

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v1

      - name: Collect changlog
        uses: xile611/collect-rush-changlog@v1
        id: changlog

      - name: Show markdown
        run: echo "Version is ${{ steps.changlog.outputs.markdown }}"
```

### inputs

| input name | required | default value | description                                                                         |
| ---------- | -------- | ------------- | ----------------------------------------------------------------------------------- |
| version    | false    |               | The version of changelog, if not specified, the lastest changelog will be collected |
| rush_path  | false    | './           | The root path of a rush project                                                     |
| black_list | false    |               | The black list of packageName, use comma to join multi package name                 |
| tags       | false    |               | The tags of packages, use comma to join multi package tag                           |

### outputs

| output name | type   | description              |
| ----------- | ------ | ------------------------ |
| markdown    | string | the markdown of changlog |

## develop

Install the dependencies

```bash
$ npm install
```

Build the typescript and package it for distribution

```bash
$ npm run build && npm run package
```

Run the tests :heavy_check_mark:

```bash
$ npm test

 PASS  ./index.test.js
  ✓ throws invalid number (3ms)
  ✓ wait 500 ms (504ms)
  ✓ test runs (95ms)

...
```

## Publish to a distribution branch

Actions are run from GitHub repos so we will checkin the packed dist folder.

Then run [ncc](https://github.com/zeit/ncc) and push the results:

```bash
$ npm run package
$ git add dist
$ git commit -a -m "prod dependencies"
$ git push origin releases/v1
```

Note: We recommend using the `--license` option for ncc, which will create a license file for all of the production node modules used in your project.

Your action is now published! :rocket:

See the [versioning documentation](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md)

## Validate

You can now validate the action by referencing `./` in a workflow in your repo (see [test.yml](.github/workflows/test.yml))

```yaml
uses: ./
with:
  path: ''./
```

See the [actions tab](https://github.com/actions/typescript-action/actions) for runs of this action! :rocket:
