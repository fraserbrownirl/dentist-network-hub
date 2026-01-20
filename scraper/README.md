# Automated Dentist Scraper

This scraper automatically collects dentist data from Google Maps using GitHub Actions with a **smart neighborhood strategy** for comprehensive coverage.

## Strategy

- **Megacities (10M+)**: Split into 10-20 neighborhoods each (e.g., Manhattan, Brooklyn, Queens...)
- **Large cities (2-10M)**: Split into 5-10 key areas
- **Medium cities (500k-2M)**: Single query with depth 3 pagination

This captures far more dentists than a single query per city.

## How It Works

1. **Runs 3x Daily**: At 2 AM, 10 AM, and 6 PM UTC
2. **Batch Processing**: Scrapes 20 queries per run
3. **Depth 3 Pagination**: Gets ~50-60 results per query instead of ~16
4. **Syncs to Database**: POSTs results to Supabase edge function
5. **Progress Tracking**: Remembers where it left off between runs
6. **Auto-Commit**: Results are automatically committed back to this repo
7. **Stops on Completion**: Automatically stops when all queries are done

## Coverage

| Category | Count | Results/Query | Est. Total Dentists |
|----------|-------|---------------|---------------------|
| Megacity neighborhoods | ~450 | ~50 | ~22,500 |
| Large city areas | ~250 | ~50 | ~12,500 |
| Medium cities | ~420 | ~50 | ~21,000 |
| **Total** | **~1,118** | | **~56,000** |

## Files

| File | Purpose |
|------|---------|
| `cities.txt` | 1,118 queries (neighborhoods + cities) |
| `progress.json` | Tracks progress |
| `all_results.csv` | Accumulated results |
| `generate_cities.py` | Regenerate with smart neighborhood splitting |

## Timeline

- **1,118 queries ÷ 60 per day = ~19 days** for completion
- Automatically stops when all queries are scraped

## Required GitHub Secrets

Set these in **Settings > Secrets and variables > Actions**:

| Secret | Description |
|--------|-------------|
| `SUPABASE_URL` | Your Supabase project URL (e.g., `https://xxx.supabase.co`) |
| `WEBHOOK_SECRET` | Secret token for authenticating the webhook |

The scraper will sync each batch to the `github-sync-webhook` edge function.

## Public Repository Benefits

Since this repo is public, GitHub Actions provides:
- **Unlimited free minutes** (vs 2,000/month for private repos)
- Currently set to 20 cities × 3 runs/day = 60 cities/day
- Completion in ~19 days

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
