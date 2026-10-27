#!/usr/bin/env node
import { runNotifyReminders } from '../lib/jobs/notifyReminders.js';

(async () => {
  try {
    const res = await runNotifyReminders();
    console.log('notify_reminders: processed', res.count);
    process.exit(0);
  } catch (e) {
    console.error('notify_reminders error', e);
    process.exit(1);
  }
})();
