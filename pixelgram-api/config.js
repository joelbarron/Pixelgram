export default {
  db: {
    host: process.env.DB_HOST || 'rethinkdb-pixelgram',
    port: process.env.DB_PORT || 28015,
    db: process.env.DB_NAME || 'pixelgram',
    setup: false
  },
  secret: process.env.PIXELGRAM_SECRET || 'pixel'
}
