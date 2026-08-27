#!/usr/bin/env node

/**
 * SOP Protocol Validation Script — Formula 1 Project
 * Validates the presence, structure, and integrity of all governance documents and logs.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '../../')

const requiredFiles = [
  { relPath: '.master/SOP.md', label: 'Standard Operating Procedures (SOP)' },
  { relPath: '.master/MasterChangeLog.md', label: 'Master Change Log' },
  { relPath: '.master/TroubleshootingLog.md', label: 'Troubleshooting Log' },
  { relPath: '.master/IdeasLog.md', label: 'Ideas & Feature Roadmap Log' },
  { relPath: '.master/FileManifest.md', label: 'Repository File Manifest' },
  { relPath: '.master/documents/implementation_plan_2026_overhaul.md', label: 'Active Implementation Plan' },
  { relPath: '.master/documents/walkthrough_2026_overhaul.md', label: 'Active Walkthrough Document' },
  { relPath: '.master/archive/archive_index.md', label: 'Archive Storage Index' },
  { relPath: '.agents/rules/sop_protocol.md', label: 'Workspace SOP Agent Rule' },
]

console.log('\n========================================')
console.log('  🏁 SOP PROTOCOL VALIDATION AUDIT')
console.log('========================================\n')

let errors = 0

requiredFiles.forEach(({ relPath, label }) => {
  const fullPath = path.join(rootDir, relPath)
  if (fs.existsSync(fullPath)) {
    const stats = fs.statSync(fullPath)
    if (stats.size > 0) {
      console.log(`  ✅ [PASS] ${label} (${relPath}) — ${stats.size} bytes`)
    } else {
      console.log(`  ❌ [FAIL] ${label} (${relPath}) — File is empty!`)
      errors++
    }
  } else {
    console.log(`  ❌ [FAIL] ${label} (${relPath}) — Missing file!`)
    errors++
  }
})

// Check TroubleshootingLog has usage counts
const troubleLogPath = path.join(rootDir, '.master/TroubleshootingLog.md')
if (fs.existsSync(troubleLogPath)) {
  const content = fs.readFileSync(troubleLogPath, 'utf8')
  if (content.includes('Fix Count:') || content.includes('## 1.')) {
    console.log('  ✅ [PASS] TroubleshootingLog structure & entries verified')
  } else {
    console.log('  ⚠️  [WARN] TroubleshootingLog should include indexed problem entries')
  }
}

console.log('\n----------------------------------------')
if (errors === 0) {
  console.log('  🎉 All SOP documents & logs are 100% compliant.\n')
  process.exit(0)
} else {
  console.error(`  🚨 Found ${errors} SOP compliance error(s). Please review required master files.\n`)
  process.exit(1)
}
