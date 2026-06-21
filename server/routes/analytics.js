const express = require('express');
const router = express.Router();
const Visitor = require('../models/Visitor');
const auth = require('../middleware/auth');

// Helper to parse user-agent
function parseUserAgent(ua) {
  if (!ua) return { browser: 'Unknown Browser', os: 'Unknown OS' };

  let os = 'Unknown OS';
  if (/windows/i.test(ua)) os = 'Windows';
  else if (/macintosh|mac os x/i.test(ua) && !/like mac os x/i.test(ua)) os = 'macOS';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
  else if (/linux/i.test(ua)) os = 'Linux';

  let browser = 'Unknown Browser';
  if (/opr\/|opera/i.test(ua)) browser = 'Opera';
  else if (/edg/i.test(ua)) browser = 'Edge';
  else if (/chrome|crios/i.test(ua)) browser = 'Chrome';
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
  else if (/safari/i.test(ua) && !/chrome|crios|edg/i.test(ua)) browser = 'Safari';

  return { browser, os };
}

// Helper to get client IP address
function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.connection.remoteAddress || req.ip || '127.0.0.1';
}

router.post('/track', async (req, res) => {
  try {
    const { page, referrer, clientOs, clientBrowser } = req.body;
    const ip = getClientIp(req);
    const userAgent = req.headers['user-agent'] || '';
    const parsedUA = parseUserAgent(userAgent);
    const browser = clientBrowser || parsedUA.browser;
    const os = clientOs || parsedUA.os;

    let country = 'Local/Unknown';
    let city = '';
    let isp = '';

    const isLocal = ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.16.');
    if (!isLocal) {
      try {
        const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,city,isp`);
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData.status === 'success') {
            country = geoData.country || 'Unknown';
            city = geoData.city || '';
            isp = geoData.isp || '';
          }
        }
      } catch (err) {
        console.error('Failed to resolve visitor location:', err.message);
      }
    }

    const newVisit = new Visitor({
      ip,
      userAgent,
      browser,
      os,
      page: page || '/',
      country,
      city,
      isp,
      referrer: referrer || 'Direct'
    });

    await newVisit.save();
    
    // Calculate start of today in Vietnam (UTC+7)
    const nowUTC = new Date();
    const nowICT = new Date(nowUTC.getTime() + 7 * 60 * 60 * 1000);
    const startOfTodayICT = new Date(nowICT.getFullYear(), nowICT.getMonth(), nowICT.getDate());
    const startOfToday = new Date(startOfTodayICT.getTime() - 7 * 60 * 60 * 1000);

    const day = String(startOfTodayICT.getDate()).padStart(2, '0');
    const month = String(startOfTodayICT.getMonth() + 1).padStart(2, '0');
    const year = startOfTodayICT.getFullYear();
    const todayDate = `${day}/${month}/${year}`;

    // Get total views
    const totalViews = await Visitor.countDocuments();

    // Get today's unique visitors
    const todayUniqueResult = await Visitor.aggregate([
      { $match: { timestamp: { $gte: startOfToday } } },
      { $group: { _id: '$ip' } },
      { $count: 'count' }
    ]);
    const todayUnique = todayUniqueResult.length > 0 ? todayUniqueResult[0].count : 0;

    res.json({ success: true, totalViews, todayUnique, todayDate });
  } catch (err) {
    console.error('Error tracking visit:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET api/analytics/public-views
// @desc    Get total views count for public display
// @access  Public
router.get('/public-views', async (req, res) => {
  try {
    const totalViews = await Visitor.countDocuments();

    // Calculate start of today in Vietnam (UTC+7)
    const nowUTC = new Date();
    const nowICT = new Date(nowUTC.getTime() + 7 * 60 * 60 * 1000);
    const startOfTodayICT = new Date(nowICT.getFullYear(), nowICT.getMonth(), nowICT.getDate());
    const startOfToday = new Date(startOfTodayICT.getTime() - 7 * 60 * 60 * 1000);

    const day = String(startOfTodayICT.getDate()).padStart(2, '0');
    const month = String(startOfTodayICT.getMonth() + 1).padStart(2, '0');
    const year = startOfTodayICT.getFullYear();
    const todayDate = `${day}/${month}/${year}`;

    // Get today's unique visitors
    const todayUniqueResult = await Visitor.aggregate([
      { $match: { timestamp: { $gte: startOfToday } } },
      { $group: { _id: '$ip' } },
      { $count: 'count' }
    ]);
    const todayUnique = todayUniqueResult.length > 0 ? todayUniqueResult[0].count : 0;

    res.json({ totalViews, todayUnique, todayDate });
  } catch (err) {
    console.error('Error getting public views:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET api/analytics/stats
// @desc    Get visitor statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const totalViews = await Visitor.countDocuments();
    
    // Aggregation to count unique visitors by distinct IP
    const uniqueVisitorsResult = await Visitor.aggregate([
      { $group: { _id: '$ip' } },
      { $count: 'count' }
    ]);
    const uniqueVisitors = uniqueVisitorsResult.length > 0 ? uniqueVisitorsResult[0].count : 0;

    // Get 100 most recent visits
    const recentVisits = await Visitor.find()
      .sort({ timestamp: -1 })
      .limit(100);

    // Extract distinct IPs from recentVisits
    const recentIps = [...new Set(recentVisits.map(v => v.ip))];

    // Aggregate counts for these IPs
    const ipCounts = await Visitor.aggregate([
      { $match: { ip: { $in: recentIps } } },
      { $group: { _id: '$ip', count: { $sum: 1 } } }
    ]);

    // Create a map of IP -> count
    const ipCountMap = {};
    ipCounts.forEach(item => {
      ipCountMap[item._id] = item.count;
    });

    // Attach counts to recentVisits
    const recentVisitsWithCounts = recentVisits.map(visit => {
      const visitObj = visit.toObject();
      visitObj.totalIpVisits = ipCountMap[visit.ip] || 1;
      return visitObj;
    });

    res.json({
      totalViews,
      uniqueVisitors,
      recentVisits: recentVisitsWithCounts
    });
  } catch (err) {
    console.error('Error fetching stats:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
