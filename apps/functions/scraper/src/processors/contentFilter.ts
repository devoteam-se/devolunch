
/**
 * Filters out evening/dinner content from restaurant pages to focus on lunch items
 */
export const filterLunchContent = (text: string): string => {
  const lines = text.split('\n');
  const filteredLines: string[] = [];
  let inEveningSection = false;

  for (const line of lines) {
    const lowerLine = line.toLowerCase().trim();

    // Detect start of evening sections
    if (
      lowerLine.includes('kvällsmeny') ||
      lowerLine.includes('evening menu') ||
      lowerLine.includes('dinner menu') ||
      lowerLine.includes('à la carte')
    ) {
      inEveningSection = true;
      continue;
    }

    // Detect start of lunch sections
    if (
      (lowerLine.includes('lunch') || lowerLine.includes('veckans')) &&
      !lowerLine.includes('kväll') &&
      !lowerLine.includes('dinner')
    ) {
      inEveningSection = false;
    }

    // Skip evening content
    if (inEveningSection) {
      continue;
    }

    // Include lunch content and general content (when not in evening section)
    filteredLines.push(line);
  }

  return filteredLines.join('\n');
};
