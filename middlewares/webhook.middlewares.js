
// import crypto from 'crypto';

// export const verifyGitHubWebhook = (req, res, next) => {
//   const payload = JSON.stringify(req.body);
//   if (!payload) {
//     return res.status(400).send('Request body empty');
//   }

//   const headerSignature = req.headers['x-hub-signature-256'] || '';
//   const signature = `sha256=${crypto.createHmac('sha256', process.env.GITHUB_APP_WEBHOOK_SECRET)
//                                       .update(payload)
//                                       .digest('hex')}`;

//   if (crypto.timingSafeEqual(Buffer.from(headerSignature), Buffer.from(signature))) {
//     next(); // Go to the next middleware
//   } else {
//     return res.status(401).send('Invalid signature');
//   }
// };
