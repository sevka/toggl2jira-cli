import { Command } from 'commander';
import { parse } from 'yaml';
import { readFileSync } from 'fs';
import { TogglService } from './services/toggl.js';
import { JiraService } from './services/jira.js';
import { TimeLogProcessor } from './services/timeLogProcessor.js';

const program = new Command();

program
  .name('toggl2jira')
  .description('CLI tool for syncing time logs from Toggl to Jira')
  .requiredOption('--start-date <date>', 'Start date (YYYY-MM-DD)')
  .requiredOption('--end-date <date>', 'End date (YYYY-MM-DD)')
  .option('--fillin', 'Fill in missing time to reach 8 hours per day')
  .option('--sync', 'Actually sync the time logs to Jira')
  .option('--config <path>', 'Path to config file', 'config.yaml')
  .parse();

const options = program.opts();

async function main() {
  try {
    // Load configuration
    const config = parse(readFileSync(options.config, 'utf8'));
    
    // Initialize services
    const togglService = new TogglService(config.toggl);
    const jiraService = new JiraService(config.jira);
    const timeLogProcessor = new TimeLogProcessor(config.time_log);

    // Get time entries from Toggl
    const timeEntries = await togglService.getTimeEntries(
      options.startDate,
      options.endDate
    );

    // Process time entries
    const processedEntries = timeLogProcessor.processTimeEntries(timeEntries);

    // Handle fillin if requested
    if (options.fillin) {
      const fillinEntries = timeLogProcessor.generateFillinEntries(
        processedEntries,
        options.startDate,
        options.endDate
      );
      processedEntries.push(...fillinEntries);
    }

    // Group entries by date
    const dailyEntries = timeLogProcessor.groupEntriesByDate(processedEntries);

    // Display entries grouped by day
    console.log('\nTime entries to be synced:');
    console.log('===========================');
    
    let totalHours = 0;
    for (const [date, entries] of Object.entries(dailyEntries)) {
      const dayTotal = entries.reduce((sum, entry) => sum + entry.duration, 0);
      totalHours += dayTotal;
      
      console.log(`\n${date}:`);
      entries.forEach(entry => {
        console.log(`  - ${entry.ticket}: ${entry.duration} hours - ${entry.description}`);
      });
      console.log(`  Total: ${dayTotal} hours`);
    }
    
    console.log('\n===========================');
    console.log(`Grand total: ${totalHours} hours`);

    // Sync time entries to Jira
    if (options.sync) {
      console.log('\nSyncing to Jira...');
      try {
        // Create all worklogs in parallel with progress reporting
        await jiraService.createWorklogsParallel(
          processedEntries,
          (entry) => console.log(`✓ Synced: ${entry.ticket}`)
        );
        console.log('\nSuccessfully synced all time entries to Jira!');
      } catch (error) {
        console.error('Error syncing to Jira:', error.message);
        process.exit(1);
      }
    } else {
      console.log('\nDry run completed. Use --sync flag to actually sync to Jira.');
    }
  } catch (error) {
    console.error('Error:', error.message);
    console.error('\nStack trace:');
    console.error(error.stack);
    process.exit(1);
  }
}

main(); 