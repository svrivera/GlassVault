const bcrypt = require('bcrypt');
const crypto = require('crypto');
const saltRounds = 10;

const algorithm = 'aes-256-cbc';
const iv = new Uint8Array(16);
const salt = 10;
const keyLength = 32;
const iterations = 1000;

const uint8ArrayToString = (uint8Array) => {
  return new TextDecoder().decode(uint8Array);
};

const stringToUint8Array = (text) => {
  return new TextEncoder().encode(text);
};

// Function to hash a password
const hashPassword = async (password) => {
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw error; // Re-throw the error to propagate it to the calling code
  }
};

// Function to compare a plaintext password with a hashed password
const comparePasswords = async (plaintextPassword, hashedPassword) => {
  return bcrypt.compare(plaintextPassword, hashedPassword);
};

const deriveKeyFromPassword = async (password) => {
  const encodedPassword = new TextEncoder().encode(password);
  const encodedSalt = new TextEncoder().encode(salt); // Use a fixed salt

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encodedPassword,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encodedSalt,
      iterations: iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: keyLength * 8 },
    false,
    ['encrypt', 'decrypt']
  );

  return derivedKey;
}

const encryptData = async (data, key) => {
  const encryptedData = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    await deriveKeyFromPassword(key),
    data
  );
  return new Uint8Array(encryptedData);
}

const decryptData = async (encryptedData, key) => {
  const decryptedData = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    await deriveKeyFromPassword(key),
    encryptedData
  );

  return new Uint8Array(decryptedData);
}

module.exports = {
    uint8ArrayToString,
    stringToUint8Array,
    hashPassword,
    comparePasswords,
    encryptData,
    decryptData
};