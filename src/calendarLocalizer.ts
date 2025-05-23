import { dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import ptBR from 'date-fns/locale/pt-BR';

const locales = {
  'en-US': enUS,
  'pt-BR': ptBR,
};

// Determine current locale for startOfWeek, default to enUS if not found
// This part might need integration with your i18n instance if you want it to be dynamic
// For now, let's assume a way to get current language or default.
// const currentLocale = locales[i18n.language] || locales['en-US']; // Example if using i18n.language
// For simplicity in this step, we'll use ptBR as the fixed locale for startOfWeek.
// A more robust solution would involve linking this to the active i18next language.

export const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date) => startOfWeek(date, { locale: locales['pt-BR'] }), // Configured for PT-BR start of week (Sunday)
  // If you want Monday as start of week for pt-BR, ensure ptBR locale data in date-fns reflects that, or use:
  // startOfWeek: (date) => startOfWeek(date, { weekStartsOn: 1 }), // 1 for Monday
  getDay,
  locales,
});

// To make it dynamically change with i18next language:
// You might need to re-initialize the localizer or components when the language changes
// or pass the locale directly to components if react-big-calendar supports it.
// For now, this setup uses a fixed locale for startOfWeek but provides multiple locales for formatting.
// The messages prop in the Calendar component will handle language for button texts etc.
// The date display format will use the locale from date-fns passed to the localizer.
// If i18n.language is 'pt-BR', dates should format in pt-BR. If 'en-US', in en-US.
// This is based on react-big-calendar's behavior with date-fns localizer.
// The key for locales object ('en-US', 'pt-BR') should match your i18n language codes.

// A more dynamic way to handle startOfWeek based on current i18n language:
// import i18n from './i18n'; // Assuming your i18n setup is accessible
// export const getLocalizedLocalizer = (lng: string) => {
//   const currentLocale = locales[lng as keyof typeof locales] || locales['en-US'];
//   return dateFnsLocalizer({
//     format,
//     parse,
//     startOfWeek: (date) => startOfWeek(date, { locale: currentLocale }),
//     getDay,
//     locales,
//   });
// };
// Then in your component: const localizer = getLocalizedLocalizer(i18n.language);
// And handle language changes. For now, the simpler version above is used.
