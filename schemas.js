const BaseJoi = require('joi');//set up to extend later
const sanitizeHtml = require('sanitize-html')
const { validate } = require('./models/user');

//define extension 
const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML.'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],//no tags are allowed
                    allowedAttributes: {},
                });//sanitizes input and yields sanitized output
                if (clean !== value) return helpers.error('string.escapeHTML', { value })//if anything was removed, throws error.
                return clean;
            }
        }
    }
})

const Joi = BaseJoi.extend(extension)//applies extension to BaseJoi

module.exports.campgroundSchema = Joi.object({//Use joi npm to set validations
    campground: Joi.object({
        title: Joi.string().required().escapeHTML(),
        price: Joi.number().required().min(0),
        // image: Joi.string().required(),
        location: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML(),
    }).required(),
    deleteImages: Joi.array(),
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required().escapeHTML(),
    }).required()
}) 