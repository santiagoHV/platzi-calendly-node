const express = require('express');

const validatorHandler = require('../middlewares/validator.handler');
const AvaliabilityService = require('../services/avaliability.service');
const {} = require('../dtos/avaliability.dtos');

const router = express.Router();
const service = new AvaliabilityService();

router.post('/', async(req, res, next) => {});

module.exports = router;