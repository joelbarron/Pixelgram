# Pixelgram
Pixelgram comparte fotos con tus amigos online!

se utiliza JavaScript Standard Style
no se utiliza babel
se utilizan pruebas con ava js

ansible-playbook -i inventory.ini pixelgram.yml --key-file ssh/deploy-pixelgram


#Paso 1
Clonar el repo

#Paso 2
ir al proyecto de deploy y ejecutar en install.sh

#Paso 3
agregar las variables de entorno al archivo production.env

#Paso 4
hacer el build de la imagen base

docker build -t pixelgram-base .

#Paso 5
levantar el docker compose
docker-compose up -d

#Paso 6
copiar los archivos de nginx del proyecto de deploy al /etc/nginx/conf.d


