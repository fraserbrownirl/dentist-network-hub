# Automated Dentist Scraper

This scraper automatically collects dentist data from Google Maps for ~200 major cities worldwide using GitHub Actions.

## How It Works

1. **Daily Schedule**: Runs automatically at 6:00 AM UTC every day
2. **Batch Processing**: Scrapes 5 cities per run to stay within rate limits
3. **Progress Tracking**: Remembers where it left off between runs
4. **Auto-Commit**: Results are automatically committed back to this repo

## Files

| File | Purpose |
|------|---------|
| `cities.txt` | List of all cities to scrape (~200 cities) |
| `progress.json` | Tracks which cities have been processed |
| `all_results.csv` | Accumulated results from all runs |

## Timeline

- **~200 cities ÷ 5 per day = ~40 days** for a complete cycle
- After completing all cities, it starts over from the beginning

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
  - cron: '0 6 * * *'  # Currently: 6 AM UTC daily
```

Common schedules:
- `'0 */6 * * *'` - Every 6 hours
- `'0 6 * * 1'` - Every Monday at 6 AM

### Change Batch Size

Edit the default in the workflow file or specify when manually triggering.

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
