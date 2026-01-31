import fs from 'fs'
import path from 'path'

function parseCsvRow(line) {
  const fields = []
  let i = 0
  while (i <= line.length) {
    if (i === line.length) {
      fields.push('')
      break
    }
    if (line[i] === '"') {
      let value = ''
      i++
      while (i < line.length) {
        if (line[i] === '"') {
          if (i + 1 < line.length && line[i + 1] === '"') {
            value += '"'
            i += 2
          } else {
            i++
            break
          }
        } else {
          value += line[i]
          i++
        }
      }
      fields.push(value)
      if (i < line.length && line[i] === ',') i++
    } else {
      const next = line.indexOf(',', i)
      if (next === -1) {
        fields.push(line.slice(i))
        break
      } else {
        fields.push(line.slice(i, next))
        i = next + 1
      }
    }
  }
  return fields
}

export default function csvWordsPlugin() {
  return {
    name: 'csv-words',
    enforce: 'pre',

    resolveId(source, importer) {
      if (source.endsWith('.csv') && source.includes('words')) {
        return path.resolve(path.dirname(importer), source)
      }
    },

    load(id) {
      if (!id.endsWith('.csv')) return
      const csvPath = id.replace(/\\/g, '/')
      const content = fs.readFileSync(csvPath, 'utf-8')
      const lines = content.split('\n').filter((l) => l.trim())
      const entries = lines.slice(1).map((line) => {
        const [word, quality, def1, def2, def3] = parseCsvRow(line)
        return { word, definitions: [def1, def2, def3], quality: Number(quality) }
      })
      this.addWatchFile(csvPath)
      return `export default ${JSON.stringify(entries)}`
    },
  }
}
