export class JiraService {
  constructor(config) {
    this.config = config;
    this.baseUrl = config.api_url;
  }

  async createWorklog(entry, onProgress) {
    try {
      // Format the date to match the working PHP implementation
      const date = new Date(entry.start);
      const jiraDate = date.toISOString().replace('Z', '+0000');

      const worklogData = {
        timeSpentSeconds: Math.ceil(entry.duration * 3600), // Convert hours to seconds
        comment: entry.description,
        started: jiraDate
      };

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

      // Report progress if callback is provided
      if (onProgress) {
        onProgress(entry);
      }
    } catch (error) {
      throw new Error(`Failed to create worklog in Jira for ticket ${entry.ticket}: ${error.message}`);
    }
  }

  async createWorklogsParallel(entries, onProgress) {
    try {
      // Create an array of promises for each entry
      const promises = entries.map(entry => this.createWorklog(entry, onProgress));
      
      // Execute all promises in parallel and wait for all to complete
      const results = await Promise.all(promises);
      
      return results;
    } catch (error) {
      // If any request fails, the entire batch fails
      throw new Error(`Failed to create worklogs in parallel: ${error.message}`);
    }
  }
} 