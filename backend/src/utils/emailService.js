// backend/src/utils/emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const sendEmail = async (options) => {
  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    html: options.html
  };

  try {
    const info = await transporter.sendMail(message);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email error:', error);
    throw error;
  }
};

const sendTaskReminderEmail = async (user, task) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Task Reminder</h2>
      <p>Hi ${user.name},</p>
      <p>This is a reminder for your task:</p>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #2563eb; margin: 0 0 10px 0;">${task.title}</h3>
        <p style="margin: 0 0 10px 0;">${task.description}</p>
        <p style="margin: 0; color: #666;">
          <strong>Due:</strong> ${new Date(task.dueDate).toLocaleDateString()}
        </p>
        <p style="margin: 5px 0 0 0; color: #666;">
          <strong>Priority:</strong> ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </p>
      </div>
      <p>Don't forget to complete this task on time!</p>
      <p>Best regards,<br>Task Reminder Team</p>
    </div>
  `;

  await sendEmail({
    email: user.email,
    subject: `Task Reminder: ${task.title}`,
    html
  });
};

module.exports = {
  sendEmail,
  sendTaskReminderEmail
};

// backend/src/utils/pushNotifications.js
const admin = require('firebase-admin');

// Check if Firebase credentials are available
const firebaseCredentials = {
  type: 'service_account',
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : null,
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
};

// Only initialize Firebase if all required credentials are present
const isFirebaseConfigured = firebaseCredentials.project_id && 
                            firebaseCredentials.private_key && 
                            firebaseCredentials.client_email;

if (isFirebaseConfigured && !admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(firebaseCredentials)
    });
    console.log('Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error);
  }
} else {
  console.log('Firebase credentials not configured. Push notifications will be disabled.');
}

const sendPushNotification = async (fcmToken, notification) => {
  if (!isFirebaseConfigured) {
    console.log('Push notifications disabled - Firebase not configured');
    return { success: false, message: 'Firebase not configured' };
  }

  try {
    const message = {
      notification: {
        title: notification.title,
        body: notification.body
      },
      data: notification.data || {},
      token: fcmToken,
      android: {
        notification: {
          icon: 'ic_notification',
          color: '#2563eb',
          sound: 'default'
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default'
          }
        }
      }
    };

    const response = await admin.messaging().send(message);
    console.log('Push notification sent:', response);
    return response;
  } catch (error) {
    console.error('Push notification error:', error);
    throw error;
  }
};

const sendMulticastNotification = async (tokens, notification) => {
  if (!isFirebaseConfigured) {
    console.log('Multicast notifications disabled - Firebase not configured');
    return { success: false, message: 'Firebase not configured' };
  }

  try {
    const message = {
      notification: {
        title: notification.title,
        body: notification.body
      },
      data: notification.data || {},
      tokens: tokens,
      android: {
        notification: {
          icon: 'ic_notification',
          color: '#2563eb',
          sound: 'default'
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default'
          }
        }
      }
    };

    const response = await admin.messaging().sendMulticast(message);
    console.log('Multicast notification sent:', response);
    return response;
  } catch (error) {
    console.error('Multicast notification error:', error);
    throw error;
  }
};

module.exports = {
  sendPushNotification,
  sendMulticastNotification
};