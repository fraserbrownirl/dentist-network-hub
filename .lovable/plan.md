
# Stop Scraper on January 31st

## Overview
Add a date check at the beginning of the workflow to automatically stop scraping after January 31st, 2026.

## Implementation

### Modify `.github/workflows/scrape.yml`

Add a new step right after "Set up Python" that checks the current date:

```yaml
- name: Check if scraping should stop
  id: date_check
  run: |
    STOP_DATE="2026-01-31"
    TODAY=$(date -u +%Y-%m-%d)
    if [[ "$TODAY" > "$STOP_DATE" ]]; then
      echo "Scraping period ended on $STOP_DATE. Today is $TODAY. Stopping."
      echo "expired=true" >> $GITHUB_OUTPUT
    else
      echo "Scraping continues. Today: $TODAY, Stop date: $STOP_DATE"
      echo "expired=false" >> $GITHUB_OUTPUT
    fi
```

Then add a condition to skip all remaining steps if expired:

```yaml
- name: Get next batch of cities
  if: steps.date_check.outputs.expired != 'true'
  # ... rest of step
```

All subsequent steps will also check this condition.

## Changes Summary

| File | Change |
|------|--------|
| `.github/workflows/scrape.yml` | Add date check step + conditional skips |

## Behavior

- **Before Feb 1st**: Scraper runs normally on schedule
- **Feb 1st onwards**: Workflow runs but exits immediately with a log message
- **Manual trigger**: Will also respect the date limit

## Alternative Option

If you want to completely disable the schedule (no workflow runs at all), you could:
1. Comment out or remove the `schedule` block
2. Or disable the workflow in GitHub UI (Actions → Daily Dentist Scraper → ... → Disable workflow)

The date-check approach is cleaner as it's self-documenting and can be easily adjusted.
