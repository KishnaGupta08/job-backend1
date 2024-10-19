const Company = require('../models/Company');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = require('twilio')(accountSid, authToken);


// Helper function to send email
const sendVerificationEmail = (company, token) => {
    const transporter = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "de732981300bc1",
          pass: "27adf5f033eeae"
        }
    });

    const mailOptions = {
        from: 'noreply@yourdomain.com',
        to: company.email,
        subject: 'Verify your email address',
        html: `<p>Click the following link to verify your email address: <a href="https://my-backend-app-ktus.onrender.com/api/auth/verify-email/${token}">Verify Email</a></p>`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
};
const sendPhoneVerification = async (phone) => {
    try {
        const verification = await client.verify.v2.services(process.env.TWILIO_SERVICE_SID)
            .verifications
            .create({ to: phone, channel: 'sms' });
        
        console.log(`OTP sent to ${phone}: ${verification.sid}`);
    } catch (err) {
        console.error('Error sending OTP: ', err.message);
    }
};



// Register a new company
exports.register = async (req, res) => {
    const { name, email, password, phone } = req.body;

    try {
        // Check if company already exists
        let company = await Company.findOne({ email });
        if (company) {
            return res.status(400).json({ message: 'Company already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
       await sendPhoneVerification(phone);
        company = new Company({
            name,
            email,
            password: hashedPassword,
            phone,
            phoneVerified: false, // New field for phone verification
             // Store OTP temporarily
            emailVerified: false
        });

        await company.save();

        // Generate verification token
        const token = jwt.sign({ id: company._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Send verification email
        sendVerificationEmail(company, token);

        res.status(201).json({ message: 'Registration successful, please verify your email' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send(err);
    }
};

// Email verification
exports.verifyEmail = async (req, res) => {
    const { token } = req.params;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const company = await Company.findById(decoded.id);

        if (!company) {
            return res.status(400).json({ message: 'Invalid token' });
        }

        company.emailVerified = true;
        await company.save();

        res.status(200).json({ message: 'Email verified successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Login a company
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if company exists
        let company = await Company.findOne({ email });
        if (!company) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check if password matches
        const isMatch = await bcrypt.compare(password, company.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check if the company is verified
        if (!company.emailVerified||!company.phoneVerified) {
            return res.status(400).json({ message: 'Please verify your email and phone number before logging in' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: company._id }, process.env.JWT_SECRET, { expiresIn: '5h' });

        res.json({ token });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.verifyPhone = async (req, res) => {
    const { phone, otp } = req.body;

    try {
        // Verify the OTP
        const verificationCheck = await client.verify.v2.services(process.env.TWILIO_SERVICE_SID)
            .verificationChecks
            .create({ to: phone, code: otp });

        if (verificationCheck.status === 'approved') {
            // OTP is valid
            const company = await Company.findOne({ phone });
            if (!company) {
                return res.status(404).json({ message: 'Company not found' });
            }

            company.phoneVerified = true;
            await company.save();
            res.status(200).json({ message: 'Phone number verified successfully' });
        } else {
            res.status(400).json({ message: 'Invalid OTP' });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Function to send OTP via SMS

