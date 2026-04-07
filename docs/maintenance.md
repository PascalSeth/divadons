# Maintenance Guide: Automated Cleanup

This guide explains how to activate and manage the automated system designed to keep the **Diva & Dons** database lean and performant.

## 1. Automated Order Cleanup
To ensure your dashboard remains clear of abandoned checkouts, the system includes an API endpoint that deletes `pending` orders older than **72 hours**.

### API Endpoint
- **URL**: `YOUR_DOMAIN/api/cron/cleanup-orders`
- **Method**: `GET` or `POST`
- **Authentication**: `Authorization: Bearer <CRON_SECRET>`

## 2. Configuration Steps

### Step 1: Set Environment Secret
In your environment variables (e.g., Vercel / GitHub Secrets), add a unique `CRON_SECRET`.
```bash
CRON_SECRET=your_long_random_string
```

### Step 2: Schedule the Task (Cron Job)
We recommend scheduling this task to run **once a day** (e.g., at midnight).

#### ⚡ Option A: Vercel Cron (Recommended)
Add a `vercel.json` file to your root directory:
```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-orders",
      "schedule": "0 0 * * *"
    }
  ]
}
```

#### 🛠️ Option B: GitHub Actions
Create a new file at `.github/workflows/cleanup.yml`:
```yaml
name: Hourly Maintenance
on:
  schedule:
    - cron: '0 0 * * *'
jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - name: Hit Cleanup API
        run: |
          curl -X POST "${{ secrets.SITE_URL }}/api/cron/cleanup-orders" \
          -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

---

## 🔒 Security Information
- **Access Control**: The endpoint will return `401 Unauthorized` if hit without the correct secret token.
- **Data Protection**: This task only targets `pending` orders. It will **NEVER** delete processing, shipped, or delivered orders.
