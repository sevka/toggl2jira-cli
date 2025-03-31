# Toggl to Jira Time Log Sync

A CLI tool for syncing time logs from Toggl to Jira.

## Features

- Sync time logs from Toggl to Jira
- Support for automatic ticket detection from time log descriptions
- Configurable ticket rules using regular expressions
- Option to fill in missing time to reach 8 hours per day
- Configurable time rounding with step and method options
- Dry run mode to preview changes

## Prerequisites

- Node.js 14 or higher
- npm (Node Package Manager)
- Toggl account with API access
- Jira account with API access

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd toggl2jira-cli
```

2. Install dependencies:
```bash
npm install
```

3. Create configuration file:
```bash
cp config.yaml.example config.yaml
```

4. Edit `config.yaml` with your credentials and settings:
- Add your Toggl user ID and password
- Add your Jira bearer token
- Configure ticket rules and other settings as needed

## Usage

Basic usage:
```bash
node src/index.js --start-date 2024-03-01 --end-date 2024-03-31
```

Options:
- `--start-date`: Start date in YYYY-MM-DD format (required)
- `--end-date`: End date in YYYY-MM-DD format (required)
- `--fillin`: Fill in missing time to reach 8 hours per day
- `--sync`: Actually sync the time logs to Jira (without this flag, it will only show what would be synced)
- `--config`: Path to config file (default: config.yaml)

Examples:

1. Preview time logs that would be synced:
```bash
node src/index.js --start-date 2024-03-01 --end-date 2024-03-31
```

2. Sync time logs and fill in missing time:
```bash
node src/index.js --start-date 2024-03-01 --end-date 2024-03-31 --fillin --sync
```

## Configuration

The `config.yaml` file contains all the necessary settings:

```yaml
# Toggl configuration
toggl:
  user: your-toggl-user-id
  password: your-toggl-password
  api_url: https://api.track.toggl.com/api/v9

# Jira configuration
jira:
  bearer_token: your-jira-bearer-token
  api_url: https://your-jira-url/rest/api/2

# Time log configuration
time_log:
  default_description: "General development work"
  description_separators: ["||", "//"]
  ticket_rules:
    ".*(daily|retro|demo).*": "ABC-123"
    "bobcat.*deploy.*": "ABC-442"
    ".*": "INTERNALOT-3251"
  fillin:
    ticket: TICKET-123
    description: "Fillin description"
  rounding:
    step: 0.25  # Round to nearest 0.25 hours (15 minutes)
    method: round  # Rounding method: 'round' or 'ceil'
```

### Rounding Configuration

The `rounding` section in the configuration controls how time entries are rounded:

- `step`: The interval to round to (default: 0.25 hours = 15 minutes)
- `method`: The rounding method to use:
  - `round`: Rounds to the nearest step (e.g., 0.3 → 0.25, 0.4 → 0.5)
  - `ceil`: Rounds up to the next step (e.g., 0.3 → 0.5, 0.4 → 0.5)

## Time Log Format

Time log descriptions in Toggl should follow this format:
```
TICKET-123 Optional ticket description || Time log description
```

- The ticket number is optional if it matches one of the ticket rules
- The ticket description is optional
- The time log description is separated by one of the configured separators
- If no description is provided, the default description will be used

## License

MIT 