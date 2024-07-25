exports.up = (pgm) => {
    pgm.createTable('songs', {
        id: {
            type: 'varchar(50)',
            notNull: true,
            primaryKey: true,
        },
        title: { type: 'varchar(1000)', notNull: true },
        year: { type: 'integer', notNull: true },
        genre: { type: 'varchar(1000)', notNull: true },
        performer: { type: 'varchar(1000)', notNull: true },
        duration: { type: 'integer' },
        albumId: {
            type: 'varchar(50)',
            references: '"albums"(id)',
            onDelete: 'SET NULL'
        },
    });
};

exports.down = (pgm) => {
    pgm.dropTable('songs');
};