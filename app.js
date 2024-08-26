if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
};//requires 'dotenv' package in development, but not in production.

const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize'); //Prevents mongo injection


//Models
const Campground = require('./models/campground');
const Review = require('./models/review');
const { campgroundSchema } = require('./schemas');
const { reviewSchema } = require('./schemas');

//Error Handling
const ExpressError = require('./utils/ExpressError');

//Routers
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');

//Link MongoAtlas for deployment
const dbUrl = process.env.DB_URL;

mongoose.connect(dbUrl)
    .then(() => {
        console.log('Database Connected.')
    }).catch(err => {
        console.log('Database Error.');
        console.log(err);
    })

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('ejs', ejsMate);

app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(mongoSanitize());

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60, // A day in seconds
    crypto: {
        secret: 'thisshouldbeabettersecret!'
    }
});

store.on('error', function (e) {
    console.log('Session store error:', e)
})

const sessionConfig = {
    store, //Pass in the MongoStore
    secret: 'needsabettersecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        name: 'session',
        httpOnly: true,
        //secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //A week in miliseconds
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
}

app.use(session(sessionConfig));
app.use(flash());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/",
];

const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/",
];

const connectSrcUrls = [
    "https://api.maptiler.com/",
];

const fontSrcUrls = [];

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dsae5an0v/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
                "https://images.unsplash.com/",
                "https://api.maptiler.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

//PASSPORT
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

//Defines how a user is stored in a session
passport.serializeUser(User.serializeUser());

//Defines how a user is removed from a session
passport.deserializeUser(User.deserializeUser());


//Stores variables for access in templates and middlewares
app.use((req, res, next) => {
    res.locals.currentUser = req.user;//from user object generated by passport
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

//Use public directory
app.use(express.static(path.join(__dirname, 'public')));


//ROUTER CONNECTIONS
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/', userRoutes);

app.get('/', (req, res) => {
    res.render('home')
})

//ERROR HANDLING
app.all('*', (req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Ooh wee, something went wrong!';
    res.status(statusCode).render('error', { err });
})

app.listen(3000, () => {
    console.log('ON PORT 3000')
})