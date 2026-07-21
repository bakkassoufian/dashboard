import nodemailer from 'nodemailer';

let transporter;

async function initMailer() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_PORT == 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Generate test SMTP service account from ethereal.email
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, 
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log('No SMTP config found. Using Ethereal Email test account: ', testAccount.user);
  }
}

// Initialize gracefully
initMailer().catch(console.error);

export const sendCredentialsEmail = async (email, firstName, password, role) => {
  if (!transporter) await initMailer();
  
  const mailOptions = {
    from: '"ODC Ecosystem" <no-reply@odc.ma>',
    to: email,
    subject: "Bienvenue sur l'écosystème ODC - Vos identifiants",
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
        <h2>Bonjour ${firstName || 'Cher(e) collaborateur(trice)'},</h2>
        <p>Votre compte pour le rôle : <b>${role}</b> a été créé avec succès sur l'écosystème ODC.</p>
        <p>Voici vos identifiants de connexion :</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #FF7900; margin: 20px 0;">
          <p style="margin: 0;"><b>Email:</b> ${email}</p>
          <p style="margin: 0; margin-top: 10px;"><b>Mot de passe:</b> ${password}</p>
        </div>
        <p><i>Ceci est un mot de passe généré automatiquement.</i></p>
        <br/>
        <p>Cordialement,<br/><b>L'équipe Orange Digital Center</b></p>
      </div>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log("Message sent: %s", info.messageId);
  const testUrl = nodemailer.getTestMessageUrl(info);
  if (testUrl) {
    console.log("Preview URL: %s", testUrl);
  }
  return testUrl || null;
};
