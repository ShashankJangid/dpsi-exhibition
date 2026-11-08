# Maintainer Bot Integration (0G Private Computer)

This repository includes **[maintainer-bot](https://github.com/Gathin23/maintainer-bot)**, an AI-powered GitHub PR review engine that runs on [0G Private Computer](https://pc.0g.ai/).

---

## 1. Overview & Capabilities

Every pull request submitted to the repository receives an automated review that evaluates code against our architectural invariants and rules defined in [`.github/maintainer/MAINTAINER.md`](../.github/maintainer/MAINTAINER.md).

### Core Features:
- **Sticky Status Comment**: A single comment edited in place as new commits arrive, detailing:
  - The suggested verdict (`merge`, `merge-with-fix`, `rework`, `close`, or `hold`).
  - The priority tier (`p0`–`p3`).
  - Specific, actionable recommendations in a kind, human tone.
  - Deterministic facts extracted from the diff (landing page changes, security paths, file counts, build artifacts).
- **Automated Labeling**: Applies standard labels (`bot-suggests:*`, `needs-maintainer`, `p0`–`p3`) based on review findings.
- **On-Demand Re-Review**: Maintainers can comment `/bot review` on any PR to trigger an instant re-evaluation.

---

## 2. Protected Subsystem Policies

| Subsystem | Policy | Enforced Verdict |
|---|---|---|
| **Landing Page** | `src/app/page.tsx`, `globals.css`, `AmbientBackground.tsx`, `CustomCursor.tsx` are frozen. | `rework` / `close` |
| **Voting Engine & Security** | `firebase-functions/*`, `src/app/api/vote/*` enforce 4-layer anti-cheat. | `hold` |
| **3D Canvas & Expo Hall** | Must preserve smooth celestial atmosphere, inverted sky dome scale, and keynote telemetry. | `merge` / `merge-with-fix` |
| **Audio Engine** | Master Web Audio engine `soundEnabled` must remain `true`. | `merge-with-fix` |
| **CI / Workflows** | Workflow changes require maintainer authorization. | `hold` |

---

## 3. GitHub Secrets & Setup

To enable automated reviews on pull requests:

1. Obtain an API key from **[pc.0g.ai](https://pc.0g.ai/)**.
2. Add the key as a repository secret:
   - Secret Name: `OG_PC_API_KEY`
   - Target: `Settings > Secrets and variables > Actions > New repository secret`
3. Provision required PR labels:
   ```bash
   ./.github/maintainer/setup-labels.sh
   ```

---

## 4. Local Execution & Dry-Run CLI

The Python review engine is self-contained in `maintainer_bot/`:

```bash
# Review a PR locally in dry-run mode (prints comment and labels without modifying GitHub)
GITHUB_TOKEN=$(gh auth token) OG_PC_API_KEY="your-key" python3 -m maintainer_bot review \
  --repo ShashankJangid/dpsi-exhibition \
  --pr 20 \
  --dry-run
```
