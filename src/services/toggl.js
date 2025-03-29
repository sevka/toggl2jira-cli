export class TogglService {
  constructor(config) {
    this.config = config;
    this.baseUrl = config.api_url;
    this.auth = btoa(`${config.user}:${config.password}`);
  }

  async getTimeEntries(startDate, endDate) {
    try {
      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate
      });

      const response = await fetch(`${this.baseUrl}/me/time_entries?${params}`, {
        headers: {
          'Authorization': `Basic ${this.auth}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to fetch time entries from Toggl: ${error.message}`);
    }
  }
} 