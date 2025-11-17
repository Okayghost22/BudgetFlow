const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendInviteEmail(to, groupName, inviteLink) {
  const msg = {
    to,
    from: process.env.EMAIL_FROM,
    subject: `You're invited to join "${groupName}" on BudgetFlow!`,
    text: `You've been invited to the group "${groupName}". Click to join: ${inviteLink}`,
    html: `<div style="font-family:sans-serif">
      <h2>You've been invited to <span style="color:#14b8a6">${groupName}</span>!</h2>
      <p>Click the button below to join:</p>
      <a href="${inviteLink}" 
        style="background: #14b8a6; color: white; padding: 10px 18px; text-decoration: none; border-radius: 6px; margin:10px 0; display:inline-block"
        >Join Group</a>
      <p>If you didn't expect this, just ignore this email.</p>
    </div>`
  };
  return sgMail.send(msg);
}

module.exports = { sendInviteEmail };
