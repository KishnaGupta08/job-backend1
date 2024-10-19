const jwt = require('jsonwebtoken');
const Company = require('../models/Company');

module.exports = async (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {

        const token1=token.split(' ')[1];
        const decoded = jwt.verify(token1, process.env.JWT_SECRET);
        req.user = decoded;
        const company = await Company.findById(req.user.id);
        if (!company) {
            return res.status(401).json({ message: 'Authorization denied' });
        }
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};
