export class JiraService {
  constructor(config) {
    this.config = config;
    this.baseUrl = config.api_url;
  }

  async createWorklog(entry) {
    try {
      // Format the date to match the working PHP implementation
      const date = new Date(entry.start);
      const jiraDate = date.toISOString().replace('Z', '+0000');

      const worklogData = {
        timeSpentSeconds: Math.ceil(entry.duration * 3600), // Convert hours to seconds
        comment: entry.description,
        started: jiraDate
      };

      console.log('Sending to Jira:', JSON.stringify(worklogData, null, 2));

      const response = await fetch(`${this.baseUrl}/issue/${entry.ticket}/worklog`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.bearer_token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(worklogData)
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('Jira API Error Response:', errorBody);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      throw new Error(`Failed to create worklog in Jira for ticket ${entry.ticket}: ${error.message}`);
    }
  }
} 