Please implement a node.js CLI application for syncing time logs from Toggl to Jira.
I'm not a node.js developer, so please implement it in a way that is easy to understand and use and using the best practices for node.js. I will give you requirements, but you are free to implement it in a way that you think is best.

Requirements:
- Use the Toggl API to get the time logs
- Use the Jira API to create the time logs
- CLI parameters:
  - --start-date: The start date to sync the time logs from
  - --end-date: The end date to sync the time logs to
- CLI flags
  - --fillin: If present and logged time for a day is less than 8 hours, you need to add time log to default ticket so the total time logged for the day is 8 hours
  - --sync: If this flag is present, you need to show the time logs that would be synced and sync the time logs to Jira. If not, you need only to show the time logs that would be synced. 
- You need to implement a configuration file that will contain the following:
  - fillin-ticket: The default ticket to add time logs to if --fillin flag is present
  - toggl-user: The Toggl user id
  - toggl-pass: The Toggl password
  - jira-bearer-token: The Jira Bearer token
  - description-separators: an array of possible separators that separates meaningfull time log description from the ticket title
  - default-description: default time log description to sent to Jira if the is no time log description in Toggl
  - ticket-rules: the set of pairs like this to find the ticket by time log description from Toggl:
  REGEXP => TICKET-NUMBER
  F.i.:
  "/bobcat.*(internal|retro).*/i" => "BOBCATM2-2",
  "/bobcat.*deploy.*/i" => "BOBCATM2-442",
  etc.

Regarding the API URLs I'm not what is better to store in the configuration file and what is better to hardcode in the code (what parts of URLs)
Toggl API URL looks like this:
https://api.track.toggl.com/api/v9/me/time_entries?start_date=START-DATE&end_date=END-DATE
The documentation is here:
https://engineering.toggl.com/docs/api/time_entries/

Jira API URL looks like this:
https://your-jira-domain/rest/api/2/issue/TICKET-NUMBER/worklog
I'm not sure where is the documentation, you can try to find it, but it works if I send the following by POST:
```
{
  "timeSpentSeconds": 900,
  "comment": "test time log",
  "started": "2024-11-18T08:11:09.826+0000"
}
```

Also you need to implement a functionality to determine the proper ticket based on description from Toggl. Usually I put the ticket number at the beginning of the time log entry description in Toggl. The regexp for ticket number is: [A-Z0-9]+\-\d+

But if there is no ticket number you need to search in the list of regexps and find the proper ticket.

After optional ticker number can be the optional ticket description that just stored automatically in Toggl, you need just to ignore it. But then it can be the optional time log description separated by separator (I use ||, but please add a configuration for this also, see description-separators). This time log description should be sent to Jira. If there is no time log description - sent default description (see default-description).

All time logs should be rounded to 0.25h (15min) minimal chunks. Please round to bigger number always (use ceiling operation).

Please implement the whole node.js application with minimal requirements and give the instruction how to build it and run.


