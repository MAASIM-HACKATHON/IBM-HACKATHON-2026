# Postman Collections for API Debugging

This folder contains Postman collections and environments for testing and debugging the IBM Hackathon 2026 APIs.

## Structure

```
02-postman-collections/
├── server-api/          # Server-side API collections
├── client-api/          # Client-side API collections
├── environments/        # Environment configurations (dev, staging, prod)
└── README.md           # This file
```

## Getting Started

1. **Import Collections**: Import the JSON files into Postman
2. **Set Environment**: Select the appropriate environment (development/staging/production)
3. **Configure Variables**: Update environment variables as needed

## Environment Variables

Common variables you'll need to configure:
- `BASE_URL`: API base URL (e.g., http://localhost:3000)
- `API_KEY`: Authentication key (if applicable)
- `AUTH_TOKEN`: JWT token for authenticated requests

## Collections

### Server API Collection
- User authentication endpoints
- Database operations
- Admin endpoints

### Client API Collection
- Public endpoints
- Client-specific operations

## Best Practices

1. Keep sensitive data in environment variables, not in collections
2. Use pre-request scripts for dynamic token generation
3. Add tests to validate responses
4. Document each request with descriptions
5. Version control your collections (commit to git)

## Notes

- Never commit `.env` files or sensitive credentials
- Use separate environments for development and production
- Update this README when adding new collections
