//Tool for populating main App
//This is run separately from the main App

const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');//destructures the imported arrays
const Campground = require('../models/campground');//extra dot to back out of directory

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
    .then(() => {
        console.log('Database Connected.')
    }).catch(err => {
        console.log('Database Error.');
        console.log(err);
    });

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const price = Math.floor(Math.random() * 20) + 10;
        const random1000 = Math.floor(Math.random() * 1000);
        const camp = new Campground({
            author: '66c4e0472efdf0ac164aae2b',
            title: `${sample(descriptors)} ${sample(places)}`,
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            geometry: {
                type: 'Point',
                coordinates: [cities[random1000].longitude, cities[random1000].latitude],
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dsae5an0v/image/upload/v1724274224/YelpCamp/otbdb43lzayjelmhtf48.jpg',
                    filename: 'YelpCamp/otbdb43lzayjelmhtf48',
                },
                {
                    url: 'https://res.cloudinary.com/dsae5an0v/image/upload/v1724274225/YelpCamp/e7qjrazz0epvycufrgmf.jpg',
                    filename: 'YelpCamp/e7qjrazz0epvycufrgmf',
                }
            ],
            description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Enim vero, molestiae qui corporis maiores laboriosam deleniti nesciunt magnam modi voluptas non, voluptates est ex maxime dolor facere eius soluta nostrum!',
            price: price,
        })
        await camp.save();
    }
};

seedDB().then(() => {
    mongoose.connection.close();
})//close connection to mongoose after generating database