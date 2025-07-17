// Temporarily disabled Firebase Admin SDK for development preview

const sendPushNotification = async () => {
  console.log('Push notification not configured for development.');
};

const sendMulticastNotification = async () => {
  console.log('Multicast notification not configured for development.');
};

module.exports = {
  sendPushNotification,
  sendMulticastNotification
};
