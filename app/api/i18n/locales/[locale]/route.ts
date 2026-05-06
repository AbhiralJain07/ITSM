import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string }> }
) {
  try {
    const { locale } = await params;
    
    // Validate locale to prevent directory traversal
    const allowedLocales = ['en-US', 'nl-NL', 'fr-FR', 'de-DE', 'es-ES', 'it-IT'];
    if (!allowedLocales.includes(locale)) {
      return NextResponse.json(
        { error: 'Locale not supported' },
        { status: 400 }
      );
    }

    const filePath = join(
      process.cwd(),
      'lib',
      'i18n',
      'locales',
      `${locale}.json`
    );

    const fileContent = await readFile(filePath, 'utf-8');
    const translations = JSON.parse(fileContent);

    return NextResponse.json(translations);
  } catch (error) {
    console.error('Error loading translations:', error);
    
    // Fallback to English if locale not found
    try {
      const fallbackPath = join(
        process.cwd(),
        'lib',
        'i18n',
        'locales',
        'en-US.json'
      );
      const fallbackContent = await readFile(fallbackPath, 'utf-8');
      const fallbackTranslations = JSON.parse(fallbackContent);
      
      return NextResponse.json(fallbackTranslations);
    } catch (fallbackError) {
      return NextResponse.json(
        { error: 'Translations not available' },
        { status: 500 }
      );
    }
  }
}
