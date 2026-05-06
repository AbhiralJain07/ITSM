import { NextRequest, NextResponse } from 'next/server';

// This is a test endpoint to simulate the external API response
export async function GET(request: NextRequest) {
  const mockResponse = {
    "copyrights": "© 2026 WeWin Limited. All rights reserved. | Winflow™",
    "executionTimeInMilliseconds": 71,
    "message": "Languages loaded successfully.",
    "numberOfElements": 1,
    "elements": {
      "currentCulture": "en-US",
      "currentUiCulture": "en-US",
      "defaultCulture": "en-US",
      "supportedLanguages": [
        {
          "culture": "nl-NL",
          "displayName": "Nederlands (Nederland)",
          "isCurrent": false,
          "isDefault": false
        },
        {
          "culture": "en-US",
          "displayName": "English (United States)",
          "isCurrent": true,
          "isDefault": true
        },
        {
          "culture": "fr-FR",
          "displayName": "français (France)",
          "isCurrent": false,
          "isDefault": false
        },
        {
          "culture": "de-DE",
          "displayName": "Deutsch (Deutschland)",
          "isCurrent": false,
          "isDefault": false
        },
        {
          "culture": "es-ES",
          "displayName": "Español (España)",
          "isCurrent": false,
          "isDefault": false
        },
        {
          "culture": "it-IT",
          "displayName": "Italiano (Italia)",
          "isCurrent": false,
          "isDefault": false
        }
      ]
    },
    "statusCode": 200
  };

  return NextResponse.json(mockResponse);
}
