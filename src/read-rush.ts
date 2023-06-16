import {join} from 'path'
import {readFileSync} from 'fs'

interface RushJson {
  projects: {
    packageName: string
    tags?: string[]
    projectFolder: string
    shouldPublish?: boolean
  }[]
}

interface CommentItem {
  comment: string
}

interface RushChangelogJson {
  name: string
  entries?: {
    version: string
    tag: string
    date: string
    comments?: {
      patch?: CommentItem[]
      minor?: CommentItem[]
      major?: CommentItem[]
    }
  }[]
}

interface LogItem {
  pkgName: string
  comments: string[]
}

export const findJsonFile = <T>(path: string, filename: string): T | null => {
  try {
    return JSON.parse(readFileSync(join(path, filename)).toString())
  } catch (e) {
    return null
  }
}

export const getPathOfPackages = (
  rushPath = './',
  filterTags?: string[],
  blackList?: string[]
): {path: string; fileName: string}[] => {
  const rushJson = findJsonFile<RushJson>(rushPath, 'rush.json')
  const packages = (rushJson?.projects ?? []).filter(project => {
    return (
      project.shouldPublish &&
      (!filterTags ||
        !filterTags.length ||
        (project.tags && project.tags.some(tag => filterTags.includes(tag)))) &&
      (!blackList ||
        !blackList.length ||
        !blackList.includes(project.packageName))
    )
  })

  return packages.map(project => ({
    path: join(rushPath, project.projectFolder),
    fileName: 'CHANGELOG.json'
  }))
}

export const readChangelogOfVersion = (
  version?: string,
  rushPath?: string,
  filterTags?: string[],
  blackList?: string[]
): LogItem[] => {
  const logs: LogItem[] = []
  const changlogInfos = getPathOfPackages(rushPath, filterTags, blackList)
  if (changlogInfos && changlogInfos.length) {
    // eslint-disable-next-line github/array-foreach
    changlogInfos.forEach(entry => {
      const changelog = findJsonFile<RushChangelogJson>(
        entry.path,
        entry.fileName
      )

      if (
        changelog &&
        changelog.name &&
        changelog.entries &&
        changelog.entries.length
      ) {
        const validateEntry = version
          ? changelog.entries.find(logEntry => logEntry.version === version)
          : changelog.entries[0]

        if (validateEntry) {
          logs.push({
            pkgName: changelog.name,
            comments: [
              ...(validateEntry.comments?.patch ?? []),
              ...(validateEntry.comments?.minor ?? []),
              ...(validateEntry.comments?.major ?? [])
            ].map(comment => comment.comment)
          })
        }
      }
    })
  }

  return logs
}

const logTypeMeta = [
  {
    type: 'feat',
    emoji: '🆕'
  },
  {
    type: 'fix',
    emoji: '🐛'
  },
  {
    type: 'refactor',
    emoji: '🔨'
  },
  {
    type: 'perf',
    emoji: '⚡'
  },
  {
    type: 'test',
    emoji: '✅ '
  },
  {
    type: 'chore',
    emoji: '🔧'
  },
  {
    type: 'revert',
    emoji: '🔙'
  },
  {
    type: 'docs',
    emoji: '📖'
  },
  {
    type: 'style',
    emoji: '💄'
  },
  {
    type: 'other',
    emoji: '🔖'
  }
]

export const convertLogsToMarkdown = (logs: LogItem[]): string => {
  let markdown = ''
  const map: Record<
    string,
    {scope: string; isBreaking: boolean; subject: string}[]
  > = {}
  const reg =
    /^(feat|fix|docs|style|refactor|perf|test|chore|revert)(\((.+)\))?(!)?: (.+)$/g

  if (logs && logs.length) {
    // eslint-disable-next-line github/array-foreach
    logs.forEach(log => {
      if (log.comments && log.comments.length) {
        // eslint-disable-next-line github/array-foreach
        log.comments.forEach(comment => {
          const matches = reg.exec(comment)

          if (matches) {
            const type = matches[1]
            const scope = matches[3]
            const isBreaking = !!matches[4]
            const subject = matches[5]

            if (!map[type]) {
              map[type] = []
            }

            map[type].push({
              scope: scope ?? log.pkgName,
              isBreaking,
              subject
            })
          } else {
            if (!map['other']) {
              map['other'] = []
            }
            map['other'].push({
              scope: log.pkgName,
              isBreaking: false,
              subject: comment
            })
          }
        })
      }
    })

    // eslint-disable-next-line github/array-foreach
    logTypeMeta.forEach(meta => {
      if (map[meta.type] && map[meta.type].length) {
        markdown += `## ${meta.emoji} ${meta.type} \n`
        // eslint-disable-next-line github/array-foreach
        map[meta.type].forEach(item => {
          markdown += `- ${item.isBreaking ? '**BREAKING** ' : ''}**${
            item.scope
          }**: ${item.subject}\n`
        })
      }
    })
  }

  return markdown
}
