const { Model } = require('objection');

class User extends Model {
  static get tableName() {
    return 'users';
  }

  // You can define additional properties, relationships, etc. here
}

module.exports = User;