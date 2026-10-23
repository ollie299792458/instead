export interface AppRedirectPreset {
  id: string;
  name: string;
  iosScheme?: string;
  androidPackage?: string;
  webFallbackUrl: string;
}

export const APP_REDIRECT_PRESETS: Record<string, AppRedirectPreset[]> = {
  'alt-duolingo': [
    {
      id: 'duolingo',
      name: 'Duolingo',
      iosScheme: 'duolingo://',
      androidPackage: 'com.duolingo',
      webFallbackUrl: 'https://www.duolingo.com',
    },
    {
      id: 'babbel',
      name: 'Babbel',
      iosScheme: 'babbel://',
      androidPackage: 'com.babbel.mobile.android.en',
      webFallbackUrl: 'https://www.babbel.com',
    },
    {
      id: 'busuu',
      name: 'Busuu',
      iosScheme: 'busuu://',
      androidPackage: 'com.busuu.android.enc',
      webFallbackUrl: 'https://www.busuu.com',
    },
  ],
  'alt-flashcards': [
    {
      id: 'anki',
      name: 'Anki',
      iosScheme: 'anki://',
      androidPackage: 'com.ichi2.anki',
      webFallbackUrl: 'https://ankiweb.net',
    },
    {
      id: 'quizlet',
      name: 'Quizlet',
      iosScheme: 'quizlet://',
      androidPackage: 'com.quizlet.quizletandroid',
      webFallbackUrl: 'https://quizlet.com',
    },
  ],
  'alt-instapaper': [
    {
      id: 'instapaper',
      name: 'Instapaper',
      iosScheme: 'instapaper://',
      androidPackage: 'com.instapaper.android',
      webFallbackUrl: 'https://www.instapaper.com',
    },
    {
      id: 'omnivore',
      name: 'Omnivore',
      iosScheme: 'omnivore://',
      androidPackage: 'app.omnivore.client',
      webFallbackUrl: 'https://omnivore.app',
    },
    {
      id: 'readwise_reader',
      name: 'Readwise Reader',
      iosScheme: 'readwise://',
      androidPackage: 'com.readwise',
      webFallbackUrl: 'https://read.readwise.io',
    },
  ],
  'alt-readingbook': [
    {
      id: 'kindle',
      name: 'Amazon Kindle',
      iosScheme: 'kindle://',
      androidPackage: 'com.amazon.kindle',
      webFallbackUrl: 'https://read.amazon.com',
    },
    {
      id: 'apple_books',
      name: 'Apple Books / Google Play Books',
      iosScheme: 'ibooks://',
      androidPackage: 'com.google.android.apps.books',
      webFallbackUrl: 'https://play.google.com/books',
    },
    {
      id: 'kobo',
      name: 'Kobo Books',
      iosScheme: 'kobo://',
      androidPackage: 'com.kobobooks.android',
      webFallbackUrl: 'https://www.kobo.com',
    },
  ],
  'alt-emails': [
    {
      id: 'gmail',
      name: 'Gmail',
      iosScheme: 'googlegmail://',
      androidPackage: 'com.google.android.gm',
      webFallbackUrl: 'https://mail.google.com',
    },
    {
      id: 'outlook',
      name: 'Outlook',
      iosScheme: 'ms-outlook://',
      androidPackage: 'com.microsoft.office.outlook',
      webFallbackUrl: 'https://outlook.live.com',
    },
    {
      id: 'default_mail',
      name: 'Default Mail App',
      iosScheme: 'mailto:',
      androidPackage: undefined,
      webFallbackUrl: 'mailto:',
    },
  ],
  'alt-googlenews': [
    {
      id: 'google_news',
      name: 'Google News',
      iosScheme: 'googlenews://',
      androidPackage: 'com.google.android.apps.magazines',
      webFallbackUrl: 'https://news.google.com',
    },
    {
      id: 'bbc_news',
      name: 'BBC News',
      iosScheme: 'bbcnews://',
      androidPackage: 'bbc.mobile.news.ww',
      webFallbackUrl: 'https://www.bbc.com/news',
    },
    {
      id: 'reuters',
      name: 'Reuters',
      iosScheme: 'reuters://',
      androidPackage: 'com.thomsonreuters.reuters',
      webFallbackUrl: 'https://www.reuters.com',
    },
  ],
};
