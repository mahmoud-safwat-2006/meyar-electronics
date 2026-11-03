# Safwa Admin Portal

Independent Next.js admin application. From this directory, install its dependencies and run:

```bash
npm install
npm run dev
```

The portal listens on `http://localhost:3001` and uses the existing API at `http://localhost:7000/api` by default. To use another API origin, set `NEXT_PUBLIC_API_URL` to the API base URL (for example, `https://api.example.com/api`).

The standalone portal requires Node.js 20.9 or newer.

Start the existing Express API from `backend/` as well. Admin accounts must already exist in the API. Staff roles and permissions are enforced by the API; the portal does not grant access based on its navigation alone.

The current backend does not have payment gateway configuration management, support conversations/complaints, or payment transaction records. The portal reports those limitations and only shows whether the Stripe server key is configured; it never exposes payment secrets.
