#rethinkdb database
#cd /Users/joel_barron/desarrollo/web/otros/pixelgram/pixelgram-db && rethinkdb &

#microservicios
cd /Users/joel_barron/desarrollo/web/otros/pixelgram/pixelgram-api && micro -p 5000 pictures.js &

cd /Users/joel_barron/desarrollo/web/otros/pixelgram/pixelgram-api && micro -p 5001 users.js &

cd /Users/joel_barron/desarrollo/web/otros/pixelgram/pixelgram-api && micro -p 5002 auth.js &

#web sockets
cd /Users/joel_barron/desarrollo/web/otros/pixelgram/pixelgram-ws && npm start &
