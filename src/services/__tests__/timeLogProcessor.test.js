import { TimeLogProcessor } from '../timeLogProcessor.js';

describe('TimeLogProcessor', () => {
  let processor;

  beforeEach(() => {
    processor = new TimeLogProcessor({
      default_description: "Default work",
      description_separators: ["||", "|"],
      ticket_rules: {
        ".*test.*": "TEST-123",
        ".*": "DEFAULT-456"
      },
      rounding: {
        step: 0.25,
        method: 'round'
      }
    });
  });

  describe('roundDuration', () => {
    it('should round to nearest step', () => {
      expect(processor.roundDuration(0.1)).toBe(0.25);
      expect(processor.roundDuration(0.3)).toBe(0.25);
      expect(processor.roundDuration(0.4)).toBe(0.5);
      expect(processor.roundDuration(0.6)).toBe(0.5);
      expect(processor.roundDuration(0.8)).toBe(0.75);
    });

    it('should use step value when rounded to 0', () => {
      expect(processor.roundDuration(0.01)).toBe(0.25);
    });
  });

  describe('findTicket', () => {
    it('should find ticket from description', () => {
      expect(processor.findTicket('ABC-123 Some work')).toBe('ABC-123');
    });

    it('should find ticket from rules when no ticket in description', () => {
      expect(processor.findTicket('Some test work')).toBe('TEST-123');
    });

    it('should use default ticket when no rules match', () => {
      expect(processor.findTicket('Some other work')).toBe('DEFAULT-456');
    });
  });

  describe('extractDescription', () => {
    it('should extract description after separator', () => {
      expect(processor.extractDescription('ABC-123 || Actual work')).toBe('Actual work');
    });

    it('should use default description when no description provided', () => {
      expect(processor.extractDescription('ABC-123')).toBe('Default work');
    });
  });
}); 