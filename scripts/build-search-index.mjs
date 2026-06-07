import { writeFile } from 'node:fs/promises'
import { pinyin } from 'pinyin-pro'
import { emotes } from '../src/data/emotes.js'

const normalize = (value) => value.toLowerCase().replace(/[\s_-]+/g, '')
const getDisplayName = (originalName) => originalName.replace(/^(?:PNG|Trash)Tuber_/, '').replace(/_/g, ' ')

const indexedEmotes = emotes.map((emote) => {
  const compactOriginal = emote.originalName.replace(/_/g, '')
  const fullPinyin = pinyin(compactOriginal, { toneType: 'none', type: 'array' }).join('')
  const shortPinyin = pinyin(compactOriginal, { pattern: 'first', toneType: 'none', type: 'array' }).join('')

  return {
    originalName: emote.originalName,
    englishName: emote.englishName,
    fileName: emote.fileName,
    displayName: getDisplayName(emote.originalName),
    searchText: normalize(
      [emote.originalName, compactOriginal, emote.englishName, fullPinyin, shortPinyin].join(' '),
    ),
  }
})

const output = `export const emoteSearchIndex = ${JSON.stringify(indexedEmotes, null, 2)}\n`

await writeFile(new URL('../src/data/emoteSearchIndex.js', import.meta.url), output)
