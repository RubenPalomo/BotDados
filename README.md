# BotDados
Bot creado en NodeJs para Telegram. Permite generar números aleatorios que simulen las tiradas de un dado para poder jugar a determinados juegos en la mencionada plataforma.
El bot está disponible en @DadillosBot y a través de los comandos asignados se acceden a los diferentes tipos de tiradas. Así, si el usuario introduce **/d** seguido de un número el bot generará un número aleatorio del 1 al número introducido, devolviendo un mensaje con la tirada. Además se le puede añadir un bonus, sumando o restando al número. Por otro lado están los comandos **/h** y **/l**, de *high* y *low* haciendo referencia a las tiradas con ventaja y desventaja de algunos juegos (tirar dos dados y quedarte con el mejor o el peor, respectivamente).
Para el juego de Crónicas de las Tinieblas tiene sus propios comandos. Así **/w** seguido de un número realiza tantas tiradas como número haya puesto el usuario en la modalidad de este sistema de juego, es decir, números del 1 al 10 repitiendo el 10 y contando como éxitos las tiradas del 8 para arriba. También admite tiradas *rote* y *10less* añadiendo una r o una l al comando.
El bot cuenta con seguridad ante comandos mal escritos o un excesivo número de tiradas.
Todos los comandos están recogidos en un mensaje de ayuda al usuario que se mandará al escribir el comando **/ayuda** o **/help**.
