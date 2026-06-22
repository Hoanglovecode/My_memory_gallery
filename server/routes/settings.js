const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const auth = require('../middleware/auth');

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
    const settingsObj = settings.toObject();
    settingsObj.chatbotApiKey = settings.chatbotApiKey ? '********' : '';
    
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
    if (!settings) {
      const initSettings = { 
        musicUrl, 
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
      if (chatbotApiKey && chatbotApiKey !== '********') {
        initSettings.chatbotApiKey = chatbotApiKey;
      }
      settings = new Settings(initSettings);
    } else {
      if (musicUrl !== undefined) settings.musicUrl = musicUrl;
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
    
    const settingsObj = settings.toObject();
    settingsObj.chatbotApiKey = settings.chatbotApiKey ? '********' : '';
    
    res.json(settingsObj);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
