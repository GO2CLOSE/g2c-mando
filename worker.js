name: Deploy Push Server to Cloudflare

on:
  push:
    branches:
      - main
    paths:
      - 'push-server/**'
      - '.github/workflows/deploy-push-server.yml'
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    name: Deploy Worker
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Deploy to Cloudflare Workers
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          workingDirectory: 'push-server'
          secrets: |
            VAPID_PUBLIC_KEY
            VAPID_PRIVATE_KEY
            VAPID_SUBJECT
            ADMIN_SECRET
        env:
          VAPID_PUBLIC_KEY: ${{ secrets.VAPID_PUBLIC_KEY }}
          VAPID_PRIVATE_KEY: ${{ secrets.VAPID_PRIVATE_KEY }}
          VAPID_SUBJECT: ${{ secrets.VAPID_SUBJECT }}
          ADMIN_SECRET: ${{ secrets.ADMIN_SECRET }}
