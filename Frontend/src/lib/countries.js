const COUNTRY_CODES = {
  'Sri Lanka': 'lk',
  India: 'in',
  'United States': 'us',
  'United Kingdom': 'gb',
  Australia: 'au',
  Canada: 'ca',
  Germany: 'de',
  Singapore: 'sg',
  'United Arab Emirates': 'ae'
};

export function getCountryFlagUrl(country) {
  const code = COUNTRY_CODES[country];
  if (!code) {
    return '';
  }
  return `https://flagcdn.com/w40/${code}.png`;
}
