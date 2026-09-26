# Monthly ingestion runs in GitHub Actions, not in the API process

Quote ingestion runs as a scheduled GitHub Actions workflow rather than a Fly scheduled machine or
an in-process scheduler inside the Express app. The scraper is a batch job with no relationship to
serving requests, and keeping it out of the web process means it cannot be affected by scale-to-zero,
cannot slow down or crash a public API request, and gets run logs, history and manual re-runs for
free. The trade-off is that ingestion needs its own copy of the MongoDB credentials as a repository
secret rather than the environment the app already has.
