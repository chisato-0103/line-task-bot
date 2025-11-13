import { parseDate } from 'chrono-node';
import { format } from 'date-fns';

export interface ParsedTask {
  title: string;
  deadline: string; // YYYY-MM-DD format
}

/**
 * Parse task from user message
 * Extracts deadline using Chrono and uses remaining text as title
 *
 * @param message User message text
 * @returns Parsed task with title and deadline
 *
 * @example
 * parseTask("明日までに数学の宿題を終わらせる")
 * // Returns: { title: "数学の宿題を終わらせる", deadline: "2024-11-15" }
 */
export function parseTask(message: string): ParsedTask | null {
  try {
    // Parse date from the message
    const result = parseDate(message, new Date(), {
      forwardDate: true,
    });

    if (!result) {
      console.warn('Could not parse date from message:', message);
      return null;
    }

    // Get the parsed date as YYYY-MM-DD
    const deadline = format(result, 'yyyy-MM-dd');

    // Extract title by removing date-related keywords
    // This is a simplified approach; you might want to enhance this
    let title = message;

    // Remove common date patterns
    const datePatterns = [
      /今日|きょう/g,
      /明日|あした/g,
      /明後日|あさって/g,
      /\d{1,2}月\d{1,2}日/g,
      /\d{4}年\d{1,2}月\d{1,2}日/g,
      /\d{1,2}日後/g,
      /\d{1,2}日間/g,
      /週末|しゅうまつ/g,
      /来週|らいしゅう/g,
      /来月|らいげつ/g,
      /\d{1,2}日まで/g,
      /までに/g,
      /の/g,
    ];

    datePatterns.forEach((pattern) => {
      title = title.replace(pattern, '');
    });

    // Clean up whitespace
    title = title.trim();

    // If title is empty, try to use a generic title
    if (!title) {
      title = `課題`;
    }

    return {
      title,
      deadline,
    };
  } catch (error) {
    console.error('Error parsing task:', error);
    return null;
  }
}

/**
 * Parse task with enhanced title extraction
 * Keeps more context in the title by using smarter pattern matching
 *
 * @param message User message text
 * @returns Parsed task with title and deadline
 */
export function parseTaskAdvanced(message: string): ParsedTask | null {
  try {
    const result = parseDate(message, new Date(), {
      forwardDate: true,
    });

    if (!result) {
      return null;
    }

    const deadline = format(result, 'yyyy-MM-dd');

    // More intelligent title extraction
    // Keep the message but mark and remove date expressions more carefully
    let title = message;

    // Remove time/date expressions at the beginning or end
    title = title
      .replace(/^(今日|きょう|明日|あした|明後日|あさって).*?(までに|の)/g, '')
      .replace(/(までに)$/g, '')
      .trim();

    if (!title) {
      title = `課題`;
    }

    return {
      title,
      deadline,
    };
  } catch (error) {
    console.error('Error parsing task (advanced):', error);
    return null;
  }
}
