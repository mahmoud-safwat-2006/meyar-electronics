const express = require('express');
const { fileUpload } = require('../controller/upload.controller');
const uploader = require('../middleware/uploder');
const { isAuth, isAdmin } = require('../config/auth');

const router = express.Router();

// Upload single file to server storage (Requires authentication)
router.post('/single', isAuth, uploader.single('file'), fileUpload);

module.exports = router;