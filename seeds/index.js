const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');
//database config
mongoose.connect('mongodb://localhost/newYelpcamp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connect');
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    //delete data
    await Campground.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const random50 = Math.floor(Math.random() * 50);
        const price = Math.floor(Math.random() * 20 + 10);
        const camp = new Campground({
            author: '62188c6afeeab1470741ea69',
            location: `${cities[random50].city},${cities[random50].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            geometry: {
                type: 'Point',
                coordinates: [cities[random50].longitude, cities[random50].latitude],
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/do9slz48n/image/upload/v1645775436/YelpCamp/qpnmfmx3gqkd2nmugjwb.png',
                    filename: 'YelpCamp/qpnmfmx3gqkd2nmugjwb',
                },
                {
                    url: 'https://res.cloudinary.com/do9slz48n/image/upload/v1645778322/YelpCamp/qo2ahs0udx5unnjedk3r.png',
                    filename: 'YelpCamp/qo2ahs0udx5unnjedk3r',
                },
            ],
            description:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Inigula efficitur libero tristique rutrum vel ut lorem. Fusce at sapien consectetur, lobortis felis at, pharetra justo. Curabitur blandit posuere ante, sed eleifend quam elementum eget. Nullam pulvinar ',
            price,
        });
        await camp.save();
    }
};
seedDB();
