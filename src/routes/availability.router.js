const express = require('express');

const validatorHandler = require('../middlewares/validator.handler');
const AvaliabilityService = require('../services/availability.service');
const {} = require('../dtos/availability.dtos');

const router = express.Router();
const service = new AvaliabilityService();

router.post('/',
    async(req, res, next) => {
        try {
            const body = req.body;
            const availability = await service.getAvailability(body);
            res.json(availability);
        } catch (error) {
            next(error);
        }
    });

module.exports = router;