#!/usr/bin/env python3
"""cl0ud-maintainer watcher daemon.

Monitors pull requests authored by Devansh (devansh8011-oss) on ShashankJangid/dpsi-exhibition.
Whenever a new PR or new commit is pushed, runs review against .github/maintainer/MAINTAINER.md
via 0G Private Computer and posts the review comment on behalf of Ojas Singh.
"""
from __future__ import annotations

import json
import os
import subprocess
import sys
from pathlib import Path

# Paths
WORKSPACE = Path(__file__).resolve().parent.parent.parent
RULES_PATH = WORKSPACE / ".github" / "maintainer" / "MAINTAINER.md"
STATE_FILE = Path.home() / ".config" / "maintainer-bot" / "devansh_reviewed.json"
REPO = "ShashankJangid/dpsi-exhibition"
TARGET_AUTHOR = "devansh8011-oss"


def ensure_state_dir():
    STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
    if not STATE_FILE.exists():
        # Initialize with PR 20 commit d30d5e2 which was already reviewed
        STATE_FILE.write_text(json.dumps({"20": "d30d5e2"}), encoding="utf-8")


def load_state() -> dict[str, str]:
    ensure_state_dir()
    try:
        return json.loads(STATE_FILE.read_text(encoding="utf-8"))
    except Exception:
        return {}


def save_state(state: dict[str, str]):
    ensure_state_dir()
    STATE_FILE.write_text(json.dumps(state, indent=2), encoding="utf-8")


def get_devansh_prs() -> list[dict]:
    """Fetch open PRs on the repository."""
    cmd = [
        "gh", "pr", "list",
        "--repo", REPO,
        "--state", "open",
        "--json", "number,title,headRefName,headRepositoryOwner,author,commits"
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"Error fetching PRs: {res.stderr}", file=sys.stderr)
        return []

    try:
        prs = json.loads(res.stdout)
    except Exception as e:
        print(f"JSON decode error: {e}", file=sys.stderr)
        return []

    target_prs = []
    for pr in prs:
        author = pr.get("author", {}).get("login", "")
        repo_owner = pr.get("headRepositoryOwner", {}).get("login", "")
        if author == TARGET_AUTHOR or repo_owner == TARGET_AUTHOR:
            target_prs.append(pr)
    return target_prs


def get_latest_commit_sha(pr_number: int) -> str | None:
    cmd = [
        "gh", "pr", "view", str(pr_number),
        "--repo", REPO,
        "--json", "commits"
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        return None
    try:
        data = json.loads(res.stdout)
        commits = data.get("commits", [])
        if commits:
            return commits[-1].get("oid")
    except Exception:
        pass
    return None


def run_review(pr_number: int) -> dict | None:
    """Run maintainer_bot review in dry-run mode to get model judgement."""
    env = os.environ.copy()
    env["PYTHONPATH"] = str(WORKSPACE)

    # Ensure OG_PC_API_KEY is available
    key_file = Path.home() / ".config" / "cleanyourtv-bot" / "0g.env"
    if "OG_PC_API_KEY" not in env and key_file.exists():
        for line in key_file.read_text(encoding="utf-8").splitlines():
            if line.startswith("OG_PC_API_KEY="):
                env["OG_PC_API_KEY"] = line.partition("=")[2].strip().strip("'\"")

    cmd = [
        sys.executable, "-m", "maintainer_bot", "review",
        "--repo", REPO,
        "--pr", str(pr_number),
        "--dry-run",
        "--force",
        "--rules", str(RULES_PATH)
    ]

    res = subprocess.run(cmd, capture_output=True, text=True, env=env, cwd=str(WORKSPACE))
    if res.returncode != 0:
        print(f"Error running review on PR {pr_number}: {res.stderr}", file=sys.stderr)
        return None

    output = res.stdout.strip()
    first_line = output.splitlines()[0] if output else "{}"
    try:
        review_data = json.loads(first_line)
    except Exception:
        review_data = {}

    # Extract text comment from stdout
    comment_body = ""
    lines = output.splitlines()
    for idx, line in enumerate(lines):
        if line.startswith("**maintainer-bot review**"):
            comment_body = "\n".join(lines[idx:])
            break

    return {
        "data": review_data,
        "raw_comment": comment_body
    }


def post_cl0ud_comment(pr_number: int, head_sha: str, review_res: dict) -> bool:
    data = review_res.get("data", {})
    verdict = data.get("verdict", "review")
    priority = data.get("priority", "p2")
    reasons = data.get("reasons", [])

    body_text = data.get("reason") or ""
    if not body_text and reasons:
        body_text = " ".join(reasons)
    if not body_text:
        body_text = review_res.get("raw_comment", "Automated code review evaluated against project architecture standards.")

    comment = f"""<!-- cl0ud-maintainer sha={head_sha[:12]} v=2 -->
### ☁ **cl0ud-maintainer review** · suggests **{verdict}** ({priority})
*Automated subsystem review on behalf of **Ojas Singh** via [0G Private Computer](https://pc.0g.ai)*

{body_text}

<details><summary>Checks & Architecture Telemetry</summary>

- **Target PR**: #{pr_number}
- **Reviewed Head SHA**: `{head_sha[:12]}`
- **Engine**: `cl0ud-maintainer` · 0G Private Computer (Router `pc.0g.ai`)
- **Review Policy**: `.github/maintainer/MAINTAINER.md`

</details>

*This automated review was evaluated and submitted on behalf of **Ojas Singh**.*"""

    cmd = [
        "gh", "pr", "comment", str(pr_number),
        "--repo", REPO,
        "--body", comment
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode == 0:
        print(f"Successfully posted cl0ud-maintainer comment to PR #{pr_number} for commit {head_sha[:12]}")
        return True
    else:
        print(f"Failed to post comment to PR #{pr_number}: {res.stderr}", file=sys.stderr)
        return False


def check_and_review_once():
    """Single polling iteration."""
    state = load_state()
    devansh_prs = get_devansh_prs()

    if not devansh_prs:
        print("No open PRs found from Devansh.")
        return

    for pr in devansh_prs:
        num = pr["number"]
        pr_str = str(num)
        head_sha = get_latest_commit_sha(num)
        if not head_sha:
            continue

        last_sha = state.get(pr_str)
        # Check if this commit was already reviewed
        if last_sha and head_sha.startswith(last_sha):
            print(f"PR #{num} (commit {head_sha[:12]}) has already been reviewed. Skipping.")
            continue

        print(f"Detected new changes on PR #{num} (New SHA: {head_sha[:12]}, Previous: {last_sha[:12] if last_sha else 'None'}).")
        review_result = run_review(num)
        if review_result:
            if post_cl0ud_comment(num, head_sha, review_result):
                state[pr_str] = head_sha
                save_state(state)


if __name__ == "__main__":
    check_and_review_once()
