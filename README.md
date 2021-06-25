## About

> Try it out on https://validate-payouts.vercel.app

In order to payout rent paid by tenants to landlords and Proper (our fee), we automatically upload payouts to Danske Bank. For now, we want to ensure (manually using this app) that the payouts we upload are what we expect them to be. So we download a file from Danske Bank with the payouts they plan to make and input the CSV in this app to check if they are what we expect.

The code here is decoupled from our main monorepo for security reason.

## Development

This is a [Next.js](https://nextjs.org/) project. To start it up locally, simply run:

```bash
yarn dev
```

And then go to http://localhost:3000

### Environment variables

The app uses the [Google Sheets API](https://developers.google.com/sheets/api). You will need to add a file named `.env.local` in the root of the project with the following content:

```
GOOGLE_SERVICE_ACCOUNT_KEY=...
GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL=...
```

You'll find the values for environment variables [on Vercel](https://vercel.com/properprototypes/validate-payouts/settings/environment-variables).

> Note, we used [this gist](https://gist.github.com/AnalyzePlatypus/a486323a331c91f738f2245ff9a1c66f) to figure out how to access a private Google Sheet.

## Deployment

The app is deployed [on Vercel](https://vercel.com/properprototypes/validate-payouts).

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
