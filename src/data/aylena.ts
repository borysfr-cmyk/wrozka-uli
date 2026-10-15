// Scena z Ayleną: realistyczne zdjęcie komnaty wróżki, ożywione animacjami.
// Wszystkie punkty są ułamkami szerokości (x) i wysokości (y) obrazu (0–1),
// więc po podmianie obrazu wystarczy poprawić liczby poniżej.

export const SCENE = {
  src: 'aylena.webp',
  srcSmall: 'aylena-small.webp',
  /** szerokość / wysokość obrazu */
  aspect: 1376 / 768,
  /** punkt, który ma zostać widoczny na wąskich ekranach (twarz) */
  focusX: 0.62,
  /** dłoń z talią: stąd wylatują karty */
  hand: { x: 0.64, y: 0.71 },
  /** obszar postaci, który reaguje na kliknięcie */
  figure: { x: 0.54, y: 0.0, w: 0.28, h: 0.78 },
  /** płomień świecy */
  candle: { x: 0.241, y: 0.588 },
  /** środek stołu, na którym kładziemy karty */
  table: { x: 0.5, y: 0.83 },
}
