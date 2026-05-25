/**
 * Paleta de cores acessível para daltônicos (Wong palette + extras)
 * Otimizada para distinguibilidade em todos os tipos de daltonismo
 */
export const CHART_COLORS = [
  '#0077BB', // Blue
  '#EE7733', // Orange
  '#009988', // Teal
  '#CC3311', // Red
  '#33BBEE', // Cyan
  '#EE3377', // Magenta
  '#BBBBBB', // Grey
  '#AA3377', // Purple
  '#44BB99', // Mint
  '#EEDD88', // Sand
  '#99DDFF', // Light blue
  '#FFAABB', // Pink
  '#004488', // Dark blue
  '#997700', // Olive
  '#882255', // Wine
];

export function getChartColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length];
}

export function getChartColorWithOpacity(index: number, opacity: number): string {
  const hex = CHART_COLORS[index % CHART_COLORS.length];
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
