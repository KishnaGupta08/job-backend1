const Job = require('../models/Job');
const Company = require('../models/Company');
const nodemailer = require('nodemailer');

// Create a new job post
exports.createJob = async (req, res) => {
    const { title, description, experienceLevel, endDate, candidates } = req.body;

    try {
        const company = await Company.findById(req.user.id);
        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        const job = new Job({
            title,
            description,
            experienceLevel,
            endDate,
            candidates,
            company: req.user.id
        });

        await job.save();
        res.status(201).json({ job });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Helper function to send email to candidates KQ66F48RJD4K6QKWDND72LWV
const sendJobEmailToCandidate = (candidateEmail, job) => {
    const transporter = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "de732981300bc1",
          pass: "27adf5f033eeae"
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: candidateEmail,
        subject: 'New Job Opportunity',
        html: `
            <p>A new job opportunity has been posted that matches your profile:</p>
            <h3>${job.title}</h3>
            <p>${job.description}</p>
            <p>Experience Level: ${job.experienceLevel}</p>
            <p>Apply before: ${new Date(job.endDate).toDateString()}</p>
            <p>Best regards,</p>
            <p>${job.company.name}</p>
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
};

// Send job emails to candidates
exports.sendEmailToCandidates = async (req, res) => {
    const { jobId } = req.body;

    try {
        const job = await Job.findById(jobId).populate('company');
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        job.candidates.forEach(candidate => {
            sendJobEmailToCandidate(candidate.email, job);
        });

        res.status(200).json({ message: 'Emails sent to candidates successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
exports.getAllJobsByCompany = async (req, res) => {
    try {
        const { companyId } = req.params;
        const jobs = await Job.find({ company: companyId });
        if (!jobs.length) {
            return res.status(404).json({ message: 'No jobs found for this company' });
        }
        res.status(200).json(jobs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
exports.getJobByIdForCompany = async (req, res) => {
    try {
        const { companyId, jobId } = req.params;
        const job = await Job.findOne({ _id: jobId, company: companyId });
        if (!job) {
            return res.status(404).json({ message: 'Job not found for this company' });
        }
        res.status(200).json(job);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
exports.updateJobForCompany = async (req, res) => {
    try {
        const { companyId, jobId } = req.params;
        const job = await Job.findOne({ _id: jobId, company: companyId });
        
        if (!job) {
            return res.status(404).json({ message: 'Job not found for this company' });
        }

        // Update fields
        const { title, description, experienceLevel, endDate } = req.body;
        if (title) job.title = title;
        if (description) job.description = description;
        if (experienceLevel) job.experienceLevel = experienceLevel;
        if (endDate) job.endDate = endDate;

        await job.save();
        res.status(200).json({ message: 'Job updated successfully', job });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
exports.deleteJobForCompany = async (req, res) => {
    try {
        const { companyId, jobId } = req.params;
        const job = await Job.findOneAndDelete({ _id: jobId, company: companyId });
        
        if (!job) {
            return res.status(404).json({ message: 'Job not found for this company' });
        }

        res.status(200).json({ message: 'Job deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
exports.partialUpdateJobForCompany = async (req, res) => {
    try {
        const { companyId, jobId } = req.params;

        // Find the job by jobId and companyId
        let job = await Job.findOne({ _id: jobId, company: companyId });
        if (!job) {
            return res.status(404).json({ message: 'Job not found for this company' });
        }

        // Only update fields that are provided in the request body
        const { title, description, experienceLevel, endDate } = req.body;
        
        if (title) job.title = title;
        if (description) job.description = description;
        if (experienceLevel) job.experienceLevel = experienceLevel;
        if (endDate) job.endDate = endDate;

        // Save the updated job
        await job.save();
        
        res.status(200).json({ message: 'Job updated successfully', job });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
