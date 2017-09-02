export default {
  db: {
    host: 'localhost',
    port: '28015',
    db: 'pixelgram',
    setup: false
  },
  secret: process.env.PIXELGRAM_SECRET || 'pixel'
}
