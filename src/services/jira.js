export class JiraService {
  constructor(config) {
    this.config = config;
    this.baseUrl = config.api_url;
  }

  async createWorklog(entry) {
    try {
      const worklogData = {
        timeSpentSeconds: Math.ceil(entry.duration * 3600), // Convert hours to seconds
        comment: entry.description,
        started: entry.start
      };

      const response = await fetch(`${this.baseUrl}/issue/${entry.ticket}/worklog`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.bearer_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(worklogData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      throw new Error(`Failed to create worklog in Jira for ticket ${entry.ticket}: ${error.message}`);
    }
  }
} 