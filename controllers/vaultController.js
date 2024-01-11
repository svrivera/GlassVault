// vaultController.js
const bcryptUtils = require('../utils/bcryptUtils');
const shamir = require('shamir-secret-sharing');
const User = require('../models/User');
const { knexInstance } = require('../db');

const threshold = 0.6;

const fetchUser = async (reqUsername) => {
  const users = await User.query();
  const foundUser = users.find(user => user.username === reqUsername);

  if (foundUser) {
    return foundUser;
  } else {
    console.error('User not found.');
  }
};

const splitSecret = async (newCode, totalShares, threshold) => {
  const secret = new TextEncoder().encode(newCode);
  const shares = await shamir.split(secret, totalShares, threshold);
  return shares;
};


const validateUsers = async (reqUsers) => {
  for (const reqUser of reqUsers) {
    const userEnteredPassword = reqUser.password;
    const user = await fetchUser(reqUser.username);

    if (!user) {
      throw new Error('User ' + reqUser.username + ' not found.');
    }
    const encryptedPassword = user.encryptedPassword;

    const passwordMatch = await bcryptUtils.comparePasswords(userEnteredPassword, encryptedPassword);

    if (!passwordMatch) {
      throw new Error('Invalid password for user ' + reqUser.username);
    }
  }
};

const saveShares = async (shares, reqUsers) => {
  if (!Array.isArray(shares)) {
    console.error('Shares is not an array:', shares);
    return; // Exit the function if shares is not an array
  }

  for (const [index, share] of shares.entries()) {
    const reqUser = reqUsers[index];
    const key = reqUser.password;
    console.log('Encrypted share:', share);
    const encryptedShare = await bcryptUtils.encryptData(share, key);

    // const stringShare = bcryptUtils.uint8ArrayToString(share);
    // const encryptedData = await bcryptUtils.encryptData(share, key);
    // const decryptedData = await bcryptUtils.decryptData(encryptedData, key);
    // const decryptedString = bcryptUtils.uint8ArrayToString(decryptedData);

    const user = await fetchUser(reqUser.username);

    // Assuming User is the objection.js model class
    await User.query().patch({ encryptedKey: Buffer.from(encryptedShare) }).where('id', user.id);
  };
};

const add2FACode = async (req, res) => {
  try {
    // Ensure req.body and req.body.code are defined
    if (!req.body || !req.body.code) {
      throw new Error('Invalid request payload. Missing "code" property.');
    }
    const newCode = req.body.code;
    const reqUsers = req.body.users;

    // Validate users credentials
    await validateUsers(reqUsers);

    const totalShares = reqUsers.length;
    const requiredSigns = Math.ceil(totalShares * threshold);

    const shares = await splitSecret(newCode, totalShares, requiredSigns);
    await saveShares(shares, reqUsers);

    res.json({ success: true, message: 'New 2FA code added successfully.' });
  } catch (error) {
    console.error('Error adding 2FA code:', error.message);
    res.json({ success: false, message: 'Failed to add new 2FA code.' });
  }
};

const get2FACode = async (req, res) => {
  try {
    // Ensure req.body and req.body.code are defined
    if (!req.body) {
      throw new Error('Invalid request payload. Missing "body" property.');
    }
    const reqUsers = req.body.users;

    // Validate users credentials
    await validateUsers(reqUsers);
    const shares = [];
    for (const reqUser of reqUsers) {
      const user = await fetchUser(reqUser.username);
      const encryptedKeyBuffer = user.encryptedKey;
      const encryptedKey = Uint8Array.from(encryptedKeyBuffer)
      const encryptionKey = reqUser.password;
      const decryptedData = await bcryptUtils.decryptData(encryptedKey, encryptionKey);
      shares.push(decryptedData);
    }
    const secret = await shamir.combine(shares);
    const secretString = bcryptUtils.uint8ArrayToString(secret);
    res.json({ success: true, code: secretString });
  } catch (error) {
    console.error('Error getting 2FA code:', error.message);
    res.json({ success: false, message: 'Failed to get 2FA code.' });
  }
}

module.exports = { add2FACode, get2FACode };