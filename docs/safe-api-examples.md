# Safe API examples

Public API examples should demonstrate structure without exposing real
credentials, customer records, phone numbers, or authenticated responses.

## Inspect the public API description

```bash
curl https://be.skipcalls.com/api-public-json
```

This endpoint returns the deliberately filtered public OpenAPI description. It
does not require a customer token and does not call an authenticated product
operation.

When adapting an example for an authenticated operation, keep the credential as
the literal placeholder `YOUR_TOKEN`. Never paste an active token into
documentation, issue reports, screenshots, or shared API workspaces.

## Recommended example data

Use synthetic values:

```json
{
  "callerName": "Example Caller",
  "callbackNumber": "+15555550123",
  "reason": "Request an appointment",
  "nextAction": "Follow up during business hours"
}
```

These examples teach the data shape without making an authenticated production
request or revealing a real caller.
