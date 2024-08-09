exports.up = (pgm) => {
    pgm.createTable('users', {
        id: {
            type: 'varchar(50)',
            notNull: true,
            primaryKey: true,
        },
        username: { type: 'varchar(100)', notNull: true },
        password: { type: 'varchar(128)', notNull: true },
        fullname: { type: 'varchar(256)', notNull: true },
    });
    pgm.createTable('authentications', {
        token: {
          type: 'text',
          notNull: true,
        },
    });
    pgm.createTable('albums', {
        id: {
            type: 'varchar(50)',
            notNull: true,
            primaryKey: true,
        },
        name: { type: 'varchar(1000)', notNull: true },
        year: { type: 'integer', notNull: true },
        cover_url: { type: 'varchar(1000)', notNull: false },
    });
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
            type: 'varchar(1000)',
            references: '"albums"(id)',
            onDelete: 'SET NULL'
        },
    });
    pgm.createTable('playlists', {
        id: {
            type: 'varchar(50)',
            notNull: true,
            primaryKey: true,
        },
        name: { type: 'varchar(200)', notNull: true },
        owner: {
            type: 'varchar(50)',
            references: '"users"(id)',
            onDelete: 'SET NULL'
        },
    });
    pgm.createTable('playlist_songs', {
        id: {
            type: 'varchar(50)',
            notNull: true,
            primaryKey: true,
        },
        playlist_id: {
            type: 'varchar(50)',
            references: '"playlists"(id)',
            onDelete: 'SET NULL'
        },
        song_id: {
            type: 'varchar(50)',
            references: '"songs"(id)',
            onDelete: 'SET NULL'
        },
    });
    pgm.createTable('collaborations', {
        id: {
            type: 'varchar(50)',
            notNull: true,
            primaryKey: true,
        },
        playlist_id: {
            type: 'varchar(50)',
            references: '"playlists"(id)',
            onDelete: 'SET NULL'
        },
        user_id: {
            type: 'varchar(50)',
            references: '"users"(id)',
            onDelete: 'SET NULL'
        },
    });
    pgm.createTable('playlist_activities', {
        id: {
            type: 'varchar(50)',
            notNull: true,
            primaryKey: true,
        },
        playlist_id: {
            type: 'varchar(50)',
            references: '"playlists"(id)',
            onDelete: 'SET NULL'
        },
        user_id: {
            type: 'varchar(50)',
            references: '"users"(id)',
            onDelete: 'SET NULL'
        },
        song_id: {
            type: 'varchar(50)',
            references: '"songs"(id)',
            onDelete: 'SET NULL'
        },
        action: { type: 'varchar(10)', notNull: true },
        time:{ type: 'datetime', notNull: true },
    });
    pgm.createTable('user_album_likes', {
        id: {
            type: 'varchar(50)',
            notNull: true,
            primaryKey: true,
        },
        album_id: {
            type: 'varchar(50)',
            references: '"albums"(id)',
            onDelete: 'SET NULL'
        },
        user_id: {
            type: 'varchar(50)',
            references: '"users"(id)',
            onDelete: 'SET NULL'
        },
    });
};

exports.down = (pgm) => {
    pgm.dropTable('user_album_likes');
    pgm.dropTable('playlist_activities');
    pgm.dropTable('collaborations');
    pgm.dropTable('playlist_songs');
    pgm.dropTable('playlists');
    pgm.dropTable('authentications');
    pgm.dropTable('songs');
    pgm.dropTable('albums');
    pgm.dropTable('users');
};