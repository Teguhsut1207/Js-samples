exports.up = (pgm) => {
    pgm.createTable('albums', {
        id: {
            type: 'varchar(50)',
            notNull: true,
            primaryKey: true,
        },
        name: { type: 'varchar(1000)', notNull: true },
        year: { type: 'integer', notNull: true },
    });
};

exports.down = (pgm) => {
    pgm.dropTable('albums');
};
