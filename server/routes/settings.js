const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const auth = require('../middleware/auth');
const { saveBase64File } = require('../utils/fileUpload');

// Helper to format settings properties and resolve static URLs dynamically
const formatSettingsUrl = (settings, req) => {
  const s = settings.toObject ? settings.toObject() : { ...settings };
  if (s.musicUrl && s.musicUrl.startsWith('/uploads/')) {
    const host = req.get('host') || '';
    let protocol = req.headers['x-forwarded-proto'] || req.protocol;
    
    // Force HTTP for local network IP addresses to fix mobile device access
    if (host.includes('localhost') || host.match(/^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|127\.)/)) {
      protocol = 'http';
    } else if (!req.headers['x-forwarded-proto']) {
      // For external domains without proxy headers, assume HTTPS in production
      protocol = 'https';
    }

    s.musicUrl = `${protocol}://${host}${s.musicUrl}`;
  }
  return s;
};

// @route   GET api/settings
// @desc    Get application settings
// @access  Public
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      // Create default settings if none exist
      const defaultSettings = new Settings({
        musicUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        musicTitle: 'SoundHelix-Song-1'
      });
      settings = await defaultSettings.save();
    }
    
    // Mask the chatbot API Key before sending to frontend
    const settingsObj = formatSettingsUrl(settings, req);
    settingsObj.chatbotApiKey = settingsObj.chatbotApiKey ? '********' : '';
    
    res.json(settingsObj);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/settings
// @desc    Update application settings
// @access  Private
router.put('/', auth, async (req, res) => {
  const { 
    musicUrl, 
    musicTitle, 
    chatbotEnabled, 
    chatbotName, 
    chatbotWelcomeMessage, 
    chatbotSystemPrompt, 
    chatbotApiKey,
    creatorFacebook,
    creatorLinkedin,
    creatorYoutube,
    creatorGithub,
    creatorTiktok,
    creatorInstagram
  } = req.body;

  try {
    let settings = await Settings.findOne();
    
    // Save base64 music to file if new one is provided
    const savedMusicUrl = musicUrl ? await saveBase64File(musicUrl, 'music') : undefined;

    if (!settings) {
      const initSettings = { 
        musicTitle, 
        chatbotEnabled, 
        chatbotName, 
        chatbotWelcomeMessage, 
        chatbotSystemPrompt,
        creatorFacebook,
        creatorLinkedin,
        creatorYoutube,
        creatorGithub,
        creatorTiktok,
        creatorInstagram
      };
      if (savedMusicUrl !== undefined) initSettings.musicUrl = savedMusicUrl;
      if (chatbotApiKey && chatbotApiKey !== '********') {
        initSettings.chatbotApiKey = chatbotApiKey;
      }
      settings = new Settings(initSettings);
    } else {
      if (savedMusicUrl !== undefined) settings.musicUrl = savedMusicUrl;
      if (musicTitle !== undefined) settings.musicTitle = musicTitle;
      if (chatbotEnabled !== undefined) settings.chatbotEnabled = chatbotEnabled;
      if (chatbotName !== undefined) settings.chatbotName = chatbotName;
      if (chatbotWelcomeMessage !== undefined) settings.chatbotWelcomeMessage = chatbotWelcomeMessage;
      if (chatbotSystemPrompt !== undefined) settings.chatbotSystemPrompt = chatbotSystemPrompt;
      if (creatorFacebook !== undefined) settings.creatorFacebook = creatorFacebook;
      if (creatorLinkedin !== undefined) settings.creatorLinkedin = creatorLinkedin;
      if (creatorYoutube !== undefined) settings.creatorYoutube = creatorYoutube;
      if (creatorGithub !== undefined) settings.creatorGithub = creatorGithub;
      if (creatorTiktok !== undefined) settings.creatorTiktok = creatorTiktok;
      if (creatorInstagram !== undefined) settings.creatorInstagram = creatorInstagram;
      
      // Only update API key if it's changed and not the masked placeholder
      if (chatbotApiKey !== undefined && chatbotApiKey !== '********') {
        settings.chatbotApiKey = chatbotApiKey;
      }
    }

    await settings.save();
    
    const settingsObj = formatSettingsUrl(settings, req);
    settingsObj.chatbotApiKey = settingsObj.chatbotApiKey ? '********' : '';
    
    res.json(settingsObj);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
