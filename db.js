const Knex = require('knex');
const { Model } = require('objection');
const knexConfig = require('./knexfile');

const knex = Knex(knexConfig.development); // Use the appropriate environment

Model.knex(knex);

module.exports = { knex };
