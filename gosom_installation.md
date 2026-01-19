# Google Maps Scraper

> Scrape data from Google Maps. Extracts data such as the name, address, phone number, website URL, rating, reviews number, latitude and longitude, reviews, email and more for each place.

---

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Flags Reference](#flags-reference)
- [Advanced Usage](#advanced-usage)
- [Performance](#performance)
- [Support the Project](#support-the-project)
- [Community](#community)
- [Contributing](#contributing)
- [References](#references)
- [License](#license)
- [Legal Notice](#legal-notice)

---

## Installation

### Using Docker (Recommended)

Two Docker image variants are available:

| Image Tag | Browser Engine | Best For |
|-----------|----------------|----------|
| Playwright (default) `latest`, `vX.X.X` | Playwright | Most users, better stability |
| Rod `latest-rod`, `vX.X.X-rod` | Rod/Chromium | Lightweight, faster startup |

```bash
# Playwright version (default)
docker pull gosom/google-maps-scraper

# Rod version (alternative)
docker pull gosom/google-maps-scraper:latest-rod
```

### Build from Source

Requirements: Go 1.25.5+

```bash
git clone https://github.com/gosom/google-maps-scraper.git
cd google-maps-scraper
go mod download

# Playwright version (default)
go build
./google-maps-scraper -input example-queries.txt -results results.csv -exit-on-inactivity 3m

# Rod version (alternative)
go build -tags rod
./google-maps-scraper -input example-queries.txt -results results.csv -exit-on-inactivity 3m
```

> First run downloads required browser libraries (Playwright or Chromium depending on version).

---

## Quick Start

### Docker

```bash
echo "dentists new york" > queries.txt

docker run -v $(pwd):/app \
  gosom/google-maps-scraper \
  -input /app/queries.txt \
  -results /app/results.csv \
  -exit-on-inactivity 3m
```

### Binary

```bash
echo "dentists new york" > queries.txt
./google-maps-scraper -input queries.txt -results results.csv -exit-on-inactivity 3m
```

---

## Flags Reference

| Flag | Default | Description |
|------|---------|-------------|
| `-input` | (required) | Path to input file with search queries |
| `-results` | `stdout` | Path to output CSV file |
| `-c` | `4` | Number of concurrent scrapers |
| `-depth` | `10` | Max pagination depth per query |
| `-lang` | `en` | Language code for results |
| `-exit-on-inactivity` | `0` | Exit after inactivity duration (e.g., `3m`) |
| `-email` | `false` | Extract emails from websites |
| `-fast-mode` | `false` | Quick mode with up to 21 results |
| `-zoom` | `15` | Zoom level for fast mode |
| `-radius` | `5000` | Search radius in meters for fast mode |
| `-geo` | | Coordinates for fast mode (`lat,lng`) |
| `-dsn` | | PostgreSQL connection string |
| `-produce` | `false` | Seed jobs to PostgreSQL |

### Email Extraction

```bash
./google-maps-scraper -input queries.txt -results results.csv -email
```

> **Note:** Email extraction increases processing time significantly.

### Fast Mode

Fast mode returns up to 21 results per query, ordered by distance. Useful for quick data collection with basic fields.

```bash
./google-maps-scraper \
  -input queries.txt \
  -results results.csv \
  -fast-mode \
  -zoom 15 \
  -radius 5000 \
  -geo '37.7749,-122.4194'
```

> **Warning:** Fast mode is in Beta. You may experience blocking.

---

## Advanced Usage

### PostgreSQL Database Provider

For distributed scraping across multiple machines:

**1. Start PostgreSQL:**

```bash
docker-compose -f docker-compose.dev.yaml up -d
```

**2. Seed the jobs:**

```bash
./google-maps-scraper \
  -dsn "postgres://postgres:postgres@localhost:5432/postgres" \
  -produce \
  -input example-queries.txt \
  -lang en
```

**3. Run scrapers (on multiple machines):**

```bash
./google-maps-scraper \
  -c 2 \
  -depth 1 \
  -dsn "postgres://postgres:postgres@localhost:5432/postgres"
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: google-maps-scraper
spec:
  replicas: 3  # Adjust based on needs
  selector:
    matchLabels:
      app: google-maps-scraper
  template:
    metadata:
      labels:
        app: google-maps-scraper
    spec:
      containers:
      - name: google-maps-scraper
        image: gosom/google-maps-scraper:latest
        args: ["-c", "1", "-depth", "10", "-dsn", "postgres://user:pass@host:5432/db"]
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
```

> **Note:** The headless browser requires significant CPU/memory resources.

### Custom Writer Plugins

Create custom output handlers using Go plugins:

**1. Write the plugin** (see `examples/plugins/example_writer.go`)

**2. Build:**

```bash
go build -buildmode=plugin -tags=plugin -o myplugin.so myplugin.go
```

**3. Run:**

```bash
./google-maps-scraper -writer ~/plugins:MyWriter -input queries.txt
```

### Export to LeadsDB

Skip the CSV files and send leads directly to a managed database. LeadsDB handles deduplication, filtering, and provides an API for your applications.

```bash
./google-maps-scraper \
  -input queries.txt \
  -leadsdb-api-key "your-api-key" \
  -exit-on-inactivity 3m
```

Or via environment variable:

```bash
export LEADSDB_API_KEY="your-api-key"
./google-maps-scraper -input queries.txt -exit-on-inactivity 3m
```

**Field Mapping**

| Google Maps | LeadsDB |
|-------------|---------|
| Title | Name |
| Category | Category |
| Categories | Tags |
| Phone | Phone |
| Website | Website |
| Address | Address, City, State, Country, PostalCode |
| Latitude/Longitude | Coordinates |
| Review Rating | Rating |
| Review Count | ReviewCount |
| Emails | Email |
| Thumbnail | LogoURL |
| CID | SourceID |

Additional fields (Google Maps link, plus code, price range, etc.) are stored as custom attributes.

Get your API key at [getleadsdb.com/settings](https://getleadsdb.com/settings) after signing up.

---

## Performance

**Expected throughput:** ~120 places/minute (with `-c 8 -depth 1`)

| Keywords | Results/Keyword | Total Jobs | Estimated Time |
|----------|-----------------|------------|----------------|
| 100 | 16 | 1,600 | ~13 minutes |
| 1,000 | 16 | 16,000 | ~2.5 hours |
| 10,000 | 16 | 160,000 | ~22 hours |

For large-scale scraping, use the PostgreSQL provider with Kubernetes.

### Telemetry

Anonymous usage statistics are collected for improvement purposes. Opt out:

```bash
export DISABLE_TELEMETRY=1
```

---

## Support the Project

This project is **free and open source**, maintained in spare time. If it's useful to you, here's how you can help it grow:

### Quick Ways to Help

| Action | Impact |
|--------|--------|
| **[Star this repo](https://github.com/gosom/google-maps-scraper)** | Helps others discover the project |
| **[Sponsor on GitHub](https://github.com/sponsors/gosom)** | Directly funds development time |
| **Share your success** | Tweet or blog about how you use it |
| **Report bugs & contribute** | Help improve the codebase |

---

## Community

Join the [Discord](https://discord.gg/google-maps-scraper) to:

- Get help with setup and configuration
- Share your use cases and success stories
- Request features and report bugs
- Connect with other users

---

## Contributing

Contributions are welcome! Please:

1. Open an issue to discuss your idea
2. Fork the repository
3. Create a pull request

See `AGENTS.md` for development guidelines.

---

## References

- [How to Extract Data from Google Maps Using Golang](https://blog.gosom.dev/how-to-extract-data-from-google-maps-using-golang)
- [Distributed Google Maps Scraping](https://blog.gosom.dev/distributed-google-maps-scraping)
- [scrapemate](https://github.com/gosom/scrapemate) - The underlying web crawling framework
- [omkarcloud/google-maps-scraper](https://github.com/omkarcloud/google-maps-scraper) - Inspiration for JS data extraction

---

## License

This project is licensed under the **MIT License**.

---

## Legal Notice

Please use this scraper responsibly and in accordance with applicable laws and regulations. Unauthorized scraping may violate terms of service.

---

> Source: [https://github.com/gosom/google-maps-scraper](https://github.com/gosom/google-maps-scraper)
