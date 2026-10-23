import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { ROOT, walk } from './helpers.js'

// Zasada wyglądu: zero emotek — tylko ikony wektorowe (lucide).
const EMOJI = /[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}️]/u

test('brak emotek w treści i w kodzie', () => {
  const files = [...walk(join(ROOT, 'content')), ...walk(join(ROOT, 'src')), join(ROOT, 'index.html')]
  const bad = []
  for (const file of files) {
    readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
      if (EMOJI.test(line)) bad.push(`${file.replace(ROOT, '')}:${i + 1}: ${line.trim()}`)
    })
  }
  assert.deepEqual(bad, [])
})
