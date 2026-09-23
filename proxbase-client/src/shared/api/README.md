# Generated API client

The backend OpenAPI schema is the source of truth. With the API running, regenerate the typed client after backend contract changes:

```bash
npm run generate:api
```

The generated schema is written to `src/shared/api/generated/openapi.ts`; the auth wrapper operations live in `generated/auth.ts` and keep browser credentials included.
