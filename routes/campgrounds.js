const express = require('express');
const router = express.Router();
const Campground = require('../models/campground');
const { isLoggedIn, isAuthor, validateCampground, detectIos } = require('../middleware');
const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');
const campgrounds = require('../controllers/campgrounds');
const { storage } = require('../cloudinary');
const multer = require('multer');
const upload = multer({ storage });

router.route('/').get(catchAsync(campgrounds.index)).post(isLoggedIn, upload.array('image', 3), validateCampground, catchAsync(campgrounds.createCampground));

router.get('/new', isLoggedIn, campgrounds.newForm);

router.route('/:id').get(catchAsync(campgrounds.showCampground)).put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground)).delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.editForm));

module.exports = router;
