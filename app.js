if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

// import npm
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const MongoDBStore = require('connect-mongo')(session);
const app = express();

//router
const campgroundsRoutes = require('./routes/campgrounds');
const reviewsRoutes = require('./routes/reviews');
const usersRoutes = require('./routes/users');
//database url (cloud or local)
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
//mongoose connector
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connect');
});

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());

// set mongo as session store
const secret = process.env.SECRET || 'testforsecret';

const store = new MongoDBStore({
    url: dbUrl,
    secret: secret,
    touchAfter: 24 * 60 * 60,
});
store.on('error', function (e) {
    console.log('SESSION ERROR:', e);
});

const sessionConfig = {
    store,
    name: 'cake',
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    },
};
app.use(session(sessionConfig));

app.use(flash());
app.use(helmet());

// helmet config
const scriptSrcUrls = ['https://stackpath.bootstrapcdn.com', 'https://api.tiles.mapbox.com', 'https://api.mapbox.com', 'https://kit.fontawesome.com', 'https://cdnjs.cloudflare.com', 'https://cdn.jsdelivr.net', 'https://code.jquery.com'];
const styleSrcUrls = ['https://kit-free.fontawesome.com', 'https://stackpath.bootstrapcdn.com', 'https://api.mapbox.com', 'https://api.tiles.mapbox.com', 'https://fonts.googleapis.com', 'https://use.fontawesome.com'];
const connectSrcUrls = ['https://api.mapbox.com', 'https://*.tiles.mapbox.com', 'https://events.mapbox.com'];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", 'blob:'],
            childSrc: ['blob:'],
            objectSrc: [],
            imgSrc: ["'self'", 'blob:', 'data:', 'https://res.cloudinary.com/do9slz48n/', 'https://images.unsplash.com'],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

// passport config
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// locals for flash
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// valid routes
app.use('/campgrounds', campgroundsRoutes);
app.use('/campgrounds/:id/reviews', reviewsRoutes);
app.use('/', usersRoutes);

app.get('/', (req, res) => {
    res.render('home');
});

// route for page not found
app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found', 404));
});

// error handler
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) {
        err.message = 'Something got wrong!!!';
    }
    res.status(statusCode).render('error', { err });
});
const port = process.env.PORT || 3000;

// port listener
app.listen(port, () => {
    console.log(`Serving on port ${port}`);
});
