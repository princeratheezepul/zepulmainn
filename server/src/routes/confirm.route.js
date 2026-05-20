import express from 'express';
import { getConfirmationDetails, submitConfirmationResponse } from '../controllers/confirm.controller.js';

const router = express.Router();

router.get('/:token', getConfirmationDetails);
router.post('/:token', submitConfirmationResponse);

export default router;
