export class TimeLogProcessor {
  constructor(config) {
    this.config = config;
    this.ticketRegex = /[A-Z0-9]+-\d+/;
  }

  processTimeEntries(entries) {
    // First merge entries with the same description
    const mergedEntries = this.mergeEntriesByDescription(entries);
    
    return mergedEntries.map(entry => {
      const { description, duration, start } = entry;
      const processedEntry = {
        ticket: this.findTicket(description),
        description: this.extractDescription(description),
        duration: this.roundDuration(duration / 3600), // Convert seconds to hours
        start: start
      };
      return processedEntry;
    });
  }

  mergeEntriesByDescription(entries) {
    // First group entries by date
    const entriesByDate = this.groupEntriesByDate(entries);
    const mergedEntries = [];

    // Merge entries within each day
    for (const [date, dayEntries] of Object.entries(entriesByDate)) {
      const mergedMap = new Map();
      
      dayEntries.forEach(entry => {
        if (mergedMap.has(entry.description)) {
          const existing = mergedMap.get(entry.description);
          existing.duration += entry.duration;
        } else {
          mergedMap.set(entry.description, { ...entry });
        }
      });

      mergedEntries.push(...Array.from(mergedMap.values()));
    }

    return mergedEntries;
  }

  findTicket(description) {
    // First try to find ticket number in the beginning of description
    const ticketMatch = description.match(this.ticketRegex);
    if (ticketMatch) {
      return ticketMatch[0];
    }

    // If no ticket found, try to match against rules
    for (const [pattern, ticket] of Object.entries(this.config.ticket_rules)) {
      const regex = new RegExp(pattern, 'i'); // Always use case-insensitive flag
      if (regex.test(description)) {
        return ticket;
      }
    }

    throw new Error(`Could not determine ticket for description: ${description}`);
  }

  extractDescription(description) {
    if (!description) {
      return this.config.default_description;
    }

    // Remove ticket number if present
    let cleanDesc = description.replace(this.ticketRegex, '').trim();

    if (!cleanDesc) {
        return this.config.default_description;
    }

    // Try to find description after separator
    for (const separator of this.config.description_separators) {
      if (cleanDesc.includes(separator)) {
        const parts = cleanDesc.split(separator);
        if (parts.length > 1) {
          return parts[1].trim();
        }
      }
    }

    // If no separator found, return the cleaned description or default
    return cleanDesc || this.config.default_description;
  }

  roundDuration(duration) {
    // Round up to nearest 0.25 (15 minutes)
    return Math.round(duration * 4) / 4;
  }

  generateFillinEntries(entries, startDate, endDate) {
    const fillinEntries = [];
    const dailyEntries = this.groupEntriesByDate(entries);
    const targetHoursPerDay = 8;

    for (const [date, dayEntries] of Object.entries(dailyEntries)) {
      const totalHours = dayEntries.reduce((sum, entry) => sum + entry.duration, 0);
      
      if (totalHours < targetHoursPerDay) {
        const fillinHours = targetHoursPerDay - totalHours;
        fillinEntries.push({
          ticket: this.config.fillin.ticket,
          description: this.config.fillin.description,
          duration: this.roundDuration(fillinHours),
          start: `${date}T09:00:00.000+0000` // Default to 9 AM
        });
      }
    }

    return fillinEntries;
  }

  groupEntriesByDate(entries) {
    return entries.reduce((acc, entry) => {
      const date = entry.start.split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(entry);
      return acc;
    }, {});
  }
} 