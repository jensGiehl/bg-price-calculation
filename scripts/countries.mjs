export const countries = [
  ['BE', 'Belgien'], ['BG', 'Bulgarien'], ['DK', 'Dänemark'],
  ['DE', 'Deutschland'], ['EE', 'Estland'], ['FI', 'Finnland'],
  ['FR', 'Frankreich'], ['GR', 'Griechenland'], ['IE', 'Irland'],
  ['IT', 'Italien'], ['HR', 'Kroatien'], ['LV', 'Lettland'],
  ['LT', 'Litauen'], ['LU', 'Luxemburg'], ['MT', 'Malta'],
  ['NL', 'Niederlande'], ['AT', 'Österreich'], ['PL', 'Polen'],
  ['PT', 'Portugal'], ['RO', 'Rumänien'], ['SE', 'Schweden'],
  ['SK', 'Slowakei'], ['SI', 'Slowenien'], ['ES', 'Spanien'],
  ['CZ', 'Tschechien'], ['HU', 'Ungarn'], ['CY', 'Zypern']
].map(([code, name]) => ({
  code,
  name,
  flag: [...code].map(letter => String.fromCodePoint(127397 + letter.charCodeAt(0))).join(''),
  zone: code === 'DE' ? 'domestic' : 'eu',
  note: ({
    DK: 'Gilt nicht für Färöer und Grönland.',
    FI: 'Gilt nicht für die Ålandinseln.',
    FR: 'Gilt nicht für überseeische Gebiete und Departements.',
    GR: 'Gilt nicht für Berg Athos.',
    IT: "Gilt nicht für Livigno und Campione d’Italia.",
    NL: 'Gilt nicht für außereuropäische Gebiete.',
    ES: 'Gilt nicht für die Kanarischen Inseln, Ceuta und Melilla.'
  })[code] ?? ''
}));
