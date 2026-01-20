# Automated Dentist Scraper

This scraper automatically collects dentist data from Google Maps for **1,990 cities worldwide** (500k+ population) using GitHub Actions.

## How It Works

1. **Runs 3x Daily**: At 2 AM, 10 AM, and 6 PM UTC
2. **Batch Processing**: Scrapes 20 cities per run for fast completion
3. **Progress Tracking**: Remembers where it left off between runs
4. **Auto-Commit**: Results are automatically committed back to this repo
5. **Stops on Completion**: Automatically stops when all cities are scraped (doesn't restart)

## Files

| File | Purpose |
|------|---------|
| `cities.txt` | List of all cities to scrape (1,990 unique cities, 500k+ population) |
| `progress.json` | Tracks which cities have been processed |
| `all_results.csv` | Accumulated results from all runs |
| `generate_cities.py` | Script to regenerate cities list (auto-deduplicates) |

## Timeline

- **1,990 cities ÷ 60 per day (3 runs × 20) = ~33 days** for completion
- Automatically stops when all cities are scraped

## Public Repository Benefits

Since this repo is public, GitHub Actions provides:
- **Unlimited free minutes** (vs 2,000/month for private repos)
- Currently set to 20 cities × 3 runs/day = 60 cities/day
- Completion in ~33 days

## Manual Trigger

You can run the scraper manually anytime:

1. Go to **Actions** tab in GitHub
2. Click **Daily Dentist Scraper**
3. Click **Run workflow**
4. Optionally change batch size (default: 5)

## Adjusting Settings

### Change Schedule

Edit `.github/workflows/scrape.yml`:
```yaml
schedule:
  - cron: '0 2,10,18 * * *'  # Currently: 3x daily at 2am, 10am, 6pm UTC
```

Common schedules:
- `'0 */6 * * *'` - Every 6 hours (4x daily)
- `'0 */8 * * *'` - Every 8 hours (3x daily)
- `'0 6 * * *'` - Once daily at 6 AM

### Change Batch Size

Current default is 20 cities per run. Edit the workflow file or specify when manually triggering.

**Note**: Higher batch sizes = faster completion but may increase risk of rate limiting by Google. 20 cities with 2 workers fits within the 30-minute timeout.

### Add/Remove Cities

Edit `cities.txt`. Format:
```
dentists City Name, Country
```

## Viewing Results

Results accumulate in `all_results.csv` with columns including:
- Business name, address, phone, website
- Ratings and review counts  
- Opening hours
- Coordinates
- And more

## Pausing the Scraper

1. Go to **Actions** tab
2. Click on **Daily Dentist Scraper**
3. Click the **...** menu → **Disable workflow**

To resume, click **Enable workflow**.
