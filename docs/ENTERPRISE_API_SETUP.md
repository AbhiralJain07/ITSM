# Enterprise API Configuration

## Environment Variables

Add these variables to your `.env.local` file for enterprise-level authentication:

```bash
# Enterprise Authentication API Configuration
AUTH_API_BASE_URL=https://your-enterprise-api.com/api/v1
AUTH_API_KEY=your_actual_enterprise_api_key_here
AUTH_API_TIMEOUT=30000
AUTH_API_IGNORE_TLS=false
```

## API Endpoints

### Authentication
- **Login**: `POST {AUTH_API_BASE_URL}/auth/login`
- **Realms/Companies**: `GET {AUTH_API_BASE_URL}/auth/realms`

### Request Format

#### Login Request
```json
{
  "realmName": "company-name",
  "userName": "username", 
  "password": "password"
}
```

#### Login Response Format
```json
{
  "elements": {
    "accessToken": "jwt-token",
    "refreshToken": "refresh-token",
    "userName": "username",
    "displayName": "Display Name",
    "email": "user@company.com",
    "tenantInternalId": "uuid",
    "roles": ["TenantAdmin", "Agent", "User"]
  }
}
```

#### Realms Response Format
```json
{
  "elements": {
    "items": [
      {
        "name": "company-name",
        "displayName": "Company Display Name",
        "realmName": "company-name"
      }
    ]
  }
}
```

## Security Configuration

### API Key Authentication
The system supports multiple authentication methods:
- `Authorization: Bearer {API_KEY}`
- `X-API-Key: {API_KEY}`

### TLS Configuration
- Set `AUTH_API_IGNORE_TLS=true` for development with self-signed certificates
- Set `AUTH_API_IGNORE_TLS=false` for production

## Development vs Production

### Development Mode
- Falls back to test endpoints if enterprise API is unavailable
- Uses localhost:3000 for test endpoints
- Logs detailed error messages

### Production Mode
- Requires valid enterprise API endpoints
- No fallback to test endpoints
- Minimal error logging for security

## Role Mapping

External roles are mapped to internal roles:
- `TenantAdmin`, `admin`, `administrator` → `admin`
- `Agent`, `agent`, `SupportAgent` → `agent`
- `User`, `user` → `user`

## Troubleshooting

### Common Issues
1. **API Connection Timeout**: Increase `AUTH_API_TIMEOUT`
2. **TLS Certificate Errors**: Set `AUTH_API_IGNORE_TLS=true` for development
3. **Authentication Failures**: Verify `AUTH_API_KEY` is correct
4. **Empty Company List**: Check realms API endpoint and response format

### Debug Logging
Enable debug logging by setting:
```bash
NODE_ENV=development
```

This will show detailed API request/response logs in the console.
