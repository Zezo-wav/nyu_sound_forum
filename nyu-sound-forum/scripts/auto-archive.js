// Auto-Archive Maintenance Script
// Run this periodically (e.g., daily via cron) to archive old unclaimed requests/gigs
// Archives requests/gigs that have been open for 30+ days with no claims

require('dotenv').config();
const Request = require('../models/Request');
const Gig = require('../models/Gig');

const ARCHIVE_DAYS = 30; // Archive after 30 days unclaimed

async function runMaintenance() {
  try {
    console.log('Running auto-archive maintenance...');
    console.log(`Archiving requests/gigs open for ${ARCHIVE_DAYS}+ days with no claims`);
    console.log('Archiving requests past their shoot date');
    
    // Archive old requests
    const archivedRequests = await Request.autoArchiveOld(ARCHIVE_DAYS);
    console.log(`Archived ${archivedRequests} old unclaimed requests`);
    
    // Archive requests past shoot date
    const expiredRequests = await Request.autoExpirePastDates();
    console.log(`Archived ${expiredRequests} requests past their shoot date`);
    
    // Archive old gigs
    const archivedGigs = await Gig.autoArchiveOld(ARCHIVE_DAYS);
    console.log(`Archived ${archivedGigs} old unfilled gigs`);
    
    console.log('Maintenance complete!');
    process.exit(0);
  } catch (err) {
    console.error('Error during maintenance:', err);
    process.exit(1);
  }
}

runMaintenance();
