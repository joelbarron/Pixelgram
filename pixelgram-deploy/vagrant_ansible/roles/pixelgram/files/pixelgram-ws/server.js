'use strict'

const http = require('http')
const socketio = require('socket.io')
const r = require('rethinkdb')
const config = require('./config')

const server = http.createServer()
const io = socketio(server)
const port = process.env.WS_PORT || 5151

r.connect(config.db, (err, conn) => {
  if (err) return console.log(err.message)

  r.table('images').changes().run(conn, (e, cursor) => {
    if (e) return console.log(e.message)

    cursor.on('data', data => {
      let image = data.new_val

      // cuando se guarda una imagen ocurre lo siguiente:
      // 1) se almacena la imagen
      // 2) se genera un public id
      // 3) se actualiza la imagen para agregarle ese public id
      // lo que queremos son solo las que ya tengan los public id, para evitar duplicidad
      if (image.publicId != null) {
        // se manda un broadcast para que todos reciban la actualizacion
        io.sockets.emit('image', image)
      }
    })
  })
})

server.listen(port, () => console.log(`listening on port ${port}`))
