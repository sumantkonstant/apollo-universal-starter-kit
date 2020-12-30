export async function up(knex) {
  return knex.schema.table('post', function(table) {
     table.string('photo').nullable();
  });
}

export async function down(knex) {
  return knex.schema.table('post', function(table) {
    table.dropColumn('photo')
  })
}