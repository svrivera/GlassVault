const bcryptUtils = require('../utils/bcryptUtils');

exports.seed = async function(knex) {
  console.log('Seeding users table...');

  try {
    // Deletes ALL existing entries
    await knex('users').del();

    const usersData = [
      { id: 1, username: "user1", password: "password1" },
      { id: 2, username: "user2", password: "password2" },
      { id: 3, username: "user3", password: "password3" }
    ];

    await Promise.all(usersData.map(async user => {
      const encryptedPassword = await bcryptUtils.hashPassword(user.password);
      await knex('users').insert({ id: user.id, username: user.username, encryptedPassword });
      console.log(`Inserted user: ${user.username}`);
    }));
    console.log('Seed completed successfully.');

  } catch (error) {
    console.error('Error during seed:', error.message);
  }
};
