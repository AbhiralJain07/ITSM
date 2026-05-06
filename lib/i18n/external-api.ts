export interface ExternalLanguage {
  culture: string;
  displayName: string;
  isCurrent: boolean;
  isDefault: boolean;
}

export interface ExternalLocalizationResponse {
  copyrights: string;
  executionTimeInMilliseconds: number;
  message: string;
  numberOfElements: number;
  elements: {
    currentCulture: string;
    currentUiCulture: string;
    defaultCulture: string;
    supportedLanguages: ExternalLanguage[];
  };
  statusCode: number;
}

export async function sendLanguageSelectionToExternalAPI(culture: string): Promise<boolean> {
  try {
    const requestBody = JSON.stringify({ culture });
    console.log('Sending language selection to external API:', { culture, requestBody });
    
    // Temporarily use test endpoint for debugging
    const response = await fetch('http://localhost:3000/api/test/language-post', {
      method: 'POST',
      headers: {
        'accept': 'text/plain',
        'Content-Type': 'application/json',
      },
      body: requestBody,
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    console.log('External API response status:', response.status);
    
    if (response.ok) {
      console.log('Language selection sent to external API successfully');
      return true;
    } else {
      // Try to get more error details
      const errorText = await response.text();
      console.warn('External API returned non-OK status:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      return false;
    }
  } catch (error) {
    console.warn('Failed to send language selection to external API:', error);
    return false;
  }
}

export async function fetchExternalLanguages(): Promise<ExternalLanguage[]> {
  try {
    // Try external API first - use the correct endpoint for GET
    const response = await fetch('https://localhost:5001/api/v1/localization/languages', {
      method: 'GET',
      headers: {
        'accept': 'application/json',
      },
      // Add timeout and handle SSL issues for localhost
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ExternalLocalizationResponse = await response.json();
    return data.elements.supportedLanguages;
  } catch (error) {
    console.warn('External API failed, using fallback languages:', error);
    
    // Try fallback to test endpoint if external API fails
    try {
      const fallbackResponse = await fetch('http://localhost:3000/api/test/languages', {
        method: 'GET',
        headers: {
          'accept': 'application/json',
        },
        signal: AbortSignal.timeout(3000),
      });

      if (fallbackResponse.ok) {
        const fallbackData: ExternalLocalizationResponse = await fallbackResponse.json();
        console.log('Using test endpoint fallback');
        return fallbackData.elements.supportedLanguages;
      }
    } catch (fallbackError) {
      console.warn('Test endpoint also failed:', fallbackError);
    }
    
    // Final fallback to default languages
    console.log('Using default language fallback');
    return [
      {
        culture: 'en-US',
        displayName: 'English (United States)',
        isCurrent: true,
        isDefault: true
      },
      {
        culture: 'nl-NL',
        displayName: 'Nederlands (Nederland)',
        isCurrent: false,
        isDefault: false
      },
      {
        culture: 'fr-FR',
        displayName: 'français (France)',
        isCurrent: false,
        isDefault: false
      },
      {
        culture: 'de-DE',
        displayName: 'Deutsch (Deutschland)',
        isCurrent: false,
        isDefault: false
      },
      // {
      //   culture: 'es-ES',
      //   displayName: 'Español (España)',
      //   isCurrent: false,
      //   isDefault: false
      // },
      {
        culture: 'it-IT',
        displayName: 'Italiano (Italia)',
        isCurrent: false,
        isDefault: false
      }
    ];
  }
}
