const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendWelcomeEmail(email, firstName) {
    const mailOptions = {
      from: `"LIB MARKETPLACE" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to LIB MARKETPLACE!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1E3A8A;">Welcome to LIB MARKETPLACE, ${firstName}!</h2>
          <p>Thank you for joining our marketplace. You can now start buying and selling with confidence.</p>
          <p>Best regards,<br>The LIB MARKETPLACE Team</p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Welcome email sent successfully');
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      throw error;
    }
  }
}

module.exports = new EmailService();

# Navigate to your Backend directory
cd "C:\Users\reviv\Projects\LIB-MARKETPLACE\Backend"

# Run the fix script
.\fix-project-structure.ps1

# Install dependencies and setup
.\setup-and-run.ps1