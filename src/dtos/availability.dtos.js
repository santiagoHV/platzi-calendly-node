const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const { listTimeZones } = require('timezone-support');

const scheduleId = Joi.objectId();
const date = Joi.date();
const timezone = Joi.string().valid(...listTimeZones());

const getAvailabilityDto = Joi.object({
    scheduleId: scheduleId.required(),
    date: date.required(),
    timezone: timezone.required()
});

module.exports = { getAvailabilityDto };