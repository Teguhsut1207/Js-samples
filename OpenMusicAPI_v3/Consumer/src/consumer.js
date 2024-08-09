const amqp = require('amqplib');
const EmailService = require('./MailSender');
const PlaylistsService = require('./service');

const init = async () => {
  const connection = await amqp.connect(process.env.RABBITMQ_SERVER);
  const channel = await connection.createChannel();
  await channel.assertQueue('export:playlist', { durable: true });

  channel.consume('export:playlist', async (msg) => {
    if (msg !== null) {
      const { playlistId, targetEmail } = JSON.parse(msg.content.toString());

      const playlistsService = new PlaylistsService();
      const emailService = new EmailService();

      const playlist = await playlistsService.getSongsFromPlaylist(playlistId);

      if (playlist === null) {
        console.error(`Playlist dengan ID ${playlistId} tidak ditemukan.`);
      } else {
        const exportedData = {
          playlist: {
            id: playlist.id,
            name: playlist.name,
            songs: playlist.songs.map((song) => ({
              id: song.id,
              title: song.title,
              performer: song.performer,
            })),
          },
        };

        await emailService.sendEmail(targetEmail, JSON.stringify(exportedData));
      }

      channel.ack(msg);
    }
  });
};

init();
