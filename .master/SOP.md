# Standard Operating Procedures (SOP) — Formula 1 Project

## 1. Purpose & Scope

This Standard Operating Procedure (SOP) defines the mandatory execution protocol for all engineering, architectural, and documentation operations within this repository. Every developer and AI assistant must adhere strictly to these rules.

---

## 2. Mandatory Response Structure

Every assistant response must strictly follow this structure:

1. **TL;DR (Top of Response)**: A concise 2–3 sentence executive summary of the response, changes made, and immediate state.
2. **Body & Verification**:
   - Technical breakdown and code changes.
   - Exact file links (clickable markdown format `[filename](file:///...)`).
   - Automated quality checks (`npm run build`, `npm run lint`, `npm run sop:validate`).
3. **Report Card (End of Response / Milestone)**:
   - **Task Completion Grade**: (0–100% or Score 1–100).
   - **Task Checklist**: Itemized list of asked requirements with checkmarks `[x]`.
   - **Quality of Work Grade**: (0–100% or Score 1–100).
   - **Problem & Root Cause Synopsis**: Explanation of any issues encountered, what went wrong, and why.
   - **Context Window Health**: Assessment of current context utilization and clear recommendation on whether to start a new conversation.
   - **Master Log Updates Checklist**: Verification that `MasterChangeLog.md`, `TroubleshootingLog.md`, `IdeasLog.md`, and `FileManifest.md` were properly updated.
   - **Hallucination Self-Check**: Clear declaration confirming zero hallucinations or highlighting any unverified assumptions.
   - **3 Improvement Ideas**: 3 actionable ideas spanning gameplay, graphics, security, profitability, SEO, UI/UX, or automation.

---

## 3. Master Log & Documentation Protocol

All project logs and documentation reside exclusively within the [`.master/`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/.master) directory to ensure they are never wiped by Vite build pipelines:

### 3.1 `MasterChangeLog.md`

- Must be updated on **every single code change**, feature addition, or file modification.
- Must follow reverse chronological versioning with date stamps, categorized by component.

### 3.2 `TroubleshootingLog.md`

- Must be updated whenever any bug, visual artifact, build error, or runtime issue is fixed.
- **Deduplication & Usage Counter**:
  - If a problem has already been logged, do not create a duplicate entry.
  - Increment its **Usage / Fix Count** (`Count: N`).
  - Keep the log sorted by **Usefulness & Frequency of Use**.

### 3.3 `IdeasLog.md`

- Tracks architectural ideas, gameplay expansions, 3D graphics enhancements, and feature backlogs.

### 3.4 `FileManifest.md`

- Authoritative inventory of all files, directories, active documentation, and archives in the repository.
- Must be updated whenever files are created, moved, renamed, or deleted.

### 3.5 `.master/archive/`

- Older versions of implementation plans, previous revision notes, and superseded documents must be preserved in `.master/archive/` rather than deleted.

---

## 4. Automated SOP Validation

Run the SOP validation script before committing changes:

```bash
npm run sop:validate
```
