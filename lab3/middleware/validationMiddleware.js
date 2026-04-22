const Joi = require('joi');

const validateRegistration = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
        full_name: Joi.string().min(2).max(100)
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message
        });
    }
    next();
};

const validateLogin = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    });

    const { error } =schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message
        });
    }
    next();
};

const validateUpdateProfile = (req, res, next) => {
    const schema = Joi.object({
        full_name: Joi.string().min(2).max(100),
        email: Joi.string().email()
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message
        });
    }
    next();
};

const validateChangePassword = (req, res, next) => {
    const schema = Joi.object({
        currentPassword: Joi.string().required(),
        newPassword: Joi.string().min(6).required(),
        confirmNewPassword: Joi.string().valid(Joi.ref('newPassword')).required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message
        });
    }
    next();
};

module.exports = {
    validateRegistration,
    validateLogin,
    validateUpdateProfile,
    validateChangePassword
};