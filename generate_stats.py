"""
generate_stats.py

Fetches language byte-counts across all public repos for a GitHub user,
aggregates them into percentages, applies a name-mapping override, and
writes the result to progress.json.

Usage:
    python generate_stats.py
"""

import json
import sys
import time
import requests

# ---- CONFIG ----
GITHUB_USERNAME = "Collins-911"
OUTPUT_FILE = "progress.json"
GITHUB_API_BASE = "https://api.github.com"

# Map GitHub's raw language names -> the keys you use in your HTML data-skill attrs
LANGUAGE_MAP = {
    "Jupyter Notebook": "machine-learning",
    "Python": "python",
    "JavaScript": "javascript",
    # merge TS into JS bucket, adjust if you want them separate
    "TypeScript": "javascript",
    "HTML": "html",
    "CSS": "css",
    "Java": "java",
    "Shell": "shell",
}

REQUEST_TIMEOUT = 10  # seconds
MAX_RETRIES = 3


def github_get(url):
    """
    GET a GitHub API URL with basic retry + rate-limit handling.
    Returns parsed JSON, or None if the request ultimately fails.
    """
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response = requests.get(url, timeout=REQUEST_TIMEOUT)
        except requests.exceptions.RequestException as exc:
            print(f"[WARN] Network error on {url} (attempt {attempt}): {exc}")
            time.sleep(2 * attempt)
            continue

        if response.status_code == 200:
            return response.json()

        if response.status_code == 403:
            # Likely rate-limited. Check the reset header if present.
            reset_ts = response.headers.get("X-RateLimit-Reset")
            remaining = response.headers.get("X-RateLimit-Remaining")
            print(
                f"[ERROR] 403 from GitHub. Remaining={remaining} ResetAt={reset_ts}")
            print("You're likely hitting the unauthenticated rate limit (60/hr).")
            print("Fix: use a GitHub personal access token and send it in headers.")
            return None

        if response.status_code == 404:
            print(f"[ERROR] 404 Not Found: {url}")
            return None

        print(f"[WARN] Unexpected status {response.status_code} on {url}")
        time.sleep(1)

    print(f"[ERROR] Giving up on {url} after {MAX_RETRIES} attempts.")
    return None


def get_all_repos(username):
    """Fetch all public repos for a user, handling pagination."""
    repos = []
    page = 1
    while True:
        url = f"{GITHUB_API_BASE}/users/{username}/repos?per_page=100&page={page}"
        data = github_get(url)
        if data is None:
            break
        if not data:  # empty list = no more pages
            break
        repos.extend(data)
        page += 1
    return repos


def aggregate_languages(repos):
    """
    Sum byte counts per language across all repos.
    Returns dict like {"Python": 40213, "JavaScript": 12044, ...}
    """
    totals = {}
    for repo in repos:
        if repo.get("fork"):
            # Skip forked repos so you don't inflate stats with others' code.
            continue

        languages_url = repo.get("languages_url")
        if not languages_url:
            continue

        lang_data = github_get(languages_url)
        if not lang_data:
            continue  # empty repo or fetch failed — just skip it

        for lang, byte_count in lang_data.items():
            totals[lang] = totals.get(lang, 0) + byte_count

    return totals


def map_and_scale(totals, mapping):
    """
    Apply the override mapping and convert raw byte totals into
    integer percentages (0-100) that sum to 100 (or 0 if no data).
    """
    if not totals:
        return {}

    # Fold raw language names into mapped keys
    mapped_totals = {}
    for lang, byte_count in totals.items():
        key = mapping.get(lang, lang.lower())
        mapped_totals[key] = mapped_totals.get(key, 0) + byte_count

    grand_total = sum(mapped_totals.values())
    if grand_total == 0:
        return {}

    # Convert to percentages, then fix rounding so they sum to exactly 100
    raw_percentages = {
        key: (byte_count / grand_total) * 100
        for key, byte_count in mapped_totals.items()
    }

    floored = {key: int(value) for key, value in raw_percentages.items()}
    remainder = 100 - sum(floored.values())

    # Distribute leftover percentage points to the languages with the
    # largest fractional remainder, so the total is exactly 100.
    fractions = sorted(
        raw_percentages.items(),
        key=lambda item: item[1] - int(item[1]),
        reverse=True,
    )
    for i in range(remainder):
        key = fractions[i % len(fractions)][0]
        floored[key] += 1

    return floored


def main():
    if GITHUB_USERNAME == "YOUR_USERNAME_HERE":
        print("[ERROR] Set GITHUB_USERNAME in the script before running.")
        sys.exit(1)

    print(f"Fetching repos for '{GITHUB_USERNAME}'...")
    repos = get_all_repos(GITHUB_USERNAME)
    print(f"Found {len(repos)} repos.")

    if not repos:
        print("[ERROR] No repos found or fetch failed. Aborting write.")
        sys.exit(1)

    totals = aggregate_languages(repos)
    percentages = map_and_scale(totals, LANGUAGE_MAP)

    if not percentages:
        print("[WARN] No language data found across repos. Writing empty file.")

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(percentages, f, indent=2, sort_keys=True)

    print(f"Wrote {OUTPUT_FILE}:")
    print(json.dumps(percentages, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
