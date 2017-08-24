// requerir la libreria del servidor
var  express = require('express')
var multer = require('multer')
var ext = require('file-extension')

//almacenar las fotografias
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './')
  },
  filename: function (req, file, cb) {
    cb(null, +Date.now()+ '.' + ext(file.originalname))
  }
})  
var upload = multer({ storage: storage }).single('picture')


// asignar auna variable
var app = express()

// asignar la libreria de pug para el renderizado de vistas
app.set('view engine', 'pug')

// asignar la ubicacion de los archivos estaticos
app.use(express.static('public'))

// asignar la vista principal
app.get('/', function(req, res) {
  res.render('index', { title: 'Pixelgram'})
})

app.get('/signup', function(req, res) {
  res.render('index', { title: 'Pixelgram - Signup'})
})

app.get('/signin', function(req, res) {
  res.render('index', { title: 'Pixelgram - Signin'})
})

app.get('/api/pictures', function(req, res) {

  var pictures = [
    {
         user: {
               username: 'joel',
               avatar: 'https://scontent.fgdl4-1.fna.fbcdn.net/v/t1.0-9/16711956_1223207707745980_945976439470965679_n.jpg?oh=d6f2a51fde2513425971bef20d241f45&oe=59AF5346'
         },
         url: 'http://materializecss.com/images/office.jpg',
         likes: 0,
         liked: false,
         createdAt: 1497294651357
    },
    {
         user: {
               username: 'ignacio',
               avatar: 'https://scontent.fgdl4-1.fna.fbcdn.net/v/t1.0-9/18698328_1401257923288019_7458050086755396274_n.jpg?oh=f753b8b2073ded51f03f6c92e7c0a5a8&oe=59E1F243'
         },
         url: 'http://materializecss.com/images/sample-1.jpg',
         likes: 6,
         liked: true,
         createdAt: 1497294651357
    }
  ]

  setTimeout(() => res.send(pictures), 2000)
  
})

app.post('/api/pictures', function(req, res) {
  upload(req, res, function (err) {
    if(err) {
      return res.send(500, "Error uploading file")
    }

    res.send('File uploaded successfuly')
  })
})


app.get('/api/user/:username', function(req, res) {
  
  const user = {
    username: 'joel',
    avatar: 'https://scontent.fgdl4-1.fna.fbcdn.net/v/t1.0-9/16711956_1223207707745980_945976439470965679_n.jpg?oh=d6f2a51fde2513425971bef20d241f45&oe=59AF5346',
    pictures: [
      {
        id: 1,
        src: 'http://shoottheframe.com/wp-content/uploads/2015/02/Laurent-Decuyper2-500x500.jpg',
        likes: 0    
      },
      {
        id: 2,
        src: 'http://www.diegoberro.com/img/proyectos/2016/07/57972560b77de__500x500.jpg',
        likes: 20     
      },
      {
        id: 3,
        src: 'http://shoottheframe.com/wp-content/uploads/2015/02/Laurent-Decuyper2-500x500.jpg',
        likes: 3    
      },
      {
        id: 4,
        src: 'http://www.diegoberro.com/img/proyectos/2016/07/57972560b77de__500x500.jpg',
        likes: 6      
      },
      {
        id: 5,
        src: 'http://shoottheframe.com/wp-content/uploads/2015/02/Laurent-Decuyper2-500x500.jpg',
        likes: 10      
      },
      {
        id: 6,
        src: 'http://www.diegoberro.com/img/proyectos/2016/07/57972560b77de__500x500.jpg',
        likes: 1     
      }    
    ]
  }

  res.send(user);
})

app.get('/:username', function(req, res) {
  res.render('index', { title: `Pixelgram - ${req.params.username}` })
})

app.get('/:username/:id', function(req, res) {
  res.render('index', { title: `Pixelgram - ${req.params.username}` })
})


// inicializar el servidor en el puerto 3000
app.listen(3000, function(err){

  if (err) return console.log('Hubo un error'),process.exit(1)

  console.log('pixelgram escuchando en el puerto 3000')
})
