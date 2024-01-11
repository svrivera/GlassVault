exports.up = function(knex) {
    return knex.schema.createTable('users', function (table) {
        table.increments('id').primary();
        table.string('username');
        table.string('encryptedPassword');
        table.binary('encryptedKey');
      });
};

exports.down = function(knex) {
    return knex.schema.dropTable('users');
};
