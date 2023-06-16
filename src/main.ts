import * as core from '@actions/core'
import {readChangelogOfVersion, convertLogsToMarkdown} from './read-rush'

async function run(): Promise<void> {
  try {
    const rushPath = core.getInput('rush_path')
    const blackList = core.getInput('black_list')
    const version = core.getInput('version')
    const tags = core.getInput('tags')
    const changlogs = readChangelogOfVersion(
      version,
      rushPath,
      tags ? tags.split(',') : undefined,
      blackList ? blackList.split(',') : undefined
    )
    const mdStr = convertLogsToMarkdown(changlogs)

    core.setOutput('markdown', mdStr)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
