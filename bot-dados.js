// Importamos la librería node-telegram-bot-api 
const { Console, count } = require('console');
const TelegramBot = require('node-telegram-bot-api');

// Creamos una constante que guarda el Token de nuestro Bot de Telegram que, previamente, hemos creado desde el bot @BotFather
const token = '1463801315:AAFAR9_UxC3PLgvYP1d0kMg_lWWMhou7jvw';

// Creamos la constante bot que utilizaremos para acceder a las propiedades de nuestro bot
const bot = new TelegramBot(token, {polling: true});


// ⚠️ Después de este comentario es donde ponemos la lógica de nuestro bot donde podemos crear los comandos y eventos para darle funcionalidades a nuestro bot


// Importamos función util para añadir tiempo de espera a ciertos elementos y creamos la constante espera que pondrá el programa en espera los milisegundos que queramos
const util = require('util');
const espera = util.promisify(setTimeout);

// Creamos la función para generar números aleatorios que será clave para las tiradas de dados
function random(numero) {
    return Math.floor(Math.random() * (numero) + 1);
}

// Just for fun ;)
async function animadorDePartidas(msg, critico_pifia) {
    if(critico_pifia=="CRITICO"){
        await espera(500);
        bot.sendMessage(msg.chat.id, "💥*¡Crítico!*💥", {parse_mode : "Markdown"})
    }
    else if(critico_pifia=="PIFIA"){
        await espera(500);
        bot.sendMessage(msg.chat.id, "💩 ¡@" + msg.from.username + " tuvo una *pifia*! 💩", {parse_mode : "Markdown"});
    }
}

// Función para realizar las tiradas de un dado estándar
function generadorTiradasStandar(numero_dados, caras_dado, msg) {
    let string = "";    // Recibirá el valor de las tiradas rodeadas de corchetes se añadirán barras invertidas para que no entre en conflicto con Markdown
    let tirada;         // Recibirá el valor de cada una de las tiradas

    if (numero_dados == null && caras_dado == null)
        return string;

    while (numero_dados > 0) {
        // Generamos un número aleatorio por cada tirada

        tirada = random(caras_dado);
        string += "\\[" + tirada + "]";
        
        if (numero_dados != 1)
            string += "+";

        // En caso de tener un crítico o una pifia llamamos al animador de partidas, por darle vidilla
        if (tirada == 20 && caras_dado == 20)
            animadorDePartidas(msg, "CRITICO");
        else if (tirada == 1 && caras_dado == 20)
            animadorDePartidas(msg, "PIFIA");

        numero_dados--;
    }

    return string;
}

// Función para realizar las tiradas con ventaja (tiramos dos dados y tomamos el mayor) y con desventaja (lo mismo pero tomamos la tirada más baja)
function generadorTiradasEspeciales(tipo, numero_dados, caras_dado, msg) {
    let string = "";
    let tirada;
    let tirada2;

    if (numero_dados == null && caras_dado == null)
        return string;

    while (numero_dados > 0) {
        // Generamos un número aleatorio por cada tirada
        tirada = random(caras_dado);
        tirada2 = random(caras_dado);
        // Remarcamos la tirada que nos interesa. Si es ventaja la mayor, si es desventaja la menor
        if ((tipo == "h" && tirada > tirada2) || (tipo == "l" && tirada < tirada2))
            string += "\\[*" + tirada + "*||" + tirada2 + "]";
        else
            string += "\\[" + tirada + "||*" + tirada2 + "*]";

        if (numero_dados != 1)
            string += "+";

        // En caso de tener un crítico o una pifia en el dado que nos interesa llamamos al animador de partidas, por darle vidilla
        if ((tirada == 20 || tirada2 == 20) && string.includes("*20*") && caras_dado == 20)
            animadorDePartidas(msg, "CRITICO");
        else if ((tirada == 1 || tirada2 == 1) && string.includes("*1*") && caras_dado == 20)
            animadorDePartidas(msg, "PIFIA");

        numero_dados--;
    }

    // En caso de tener un crítico o una pifia llamamos al animador de partidas, por darle vidilla
    if (string.includes("(20)") && caras_dado == 20)
        animadorDePartidas(msg, "CRITICO");
    else if (string.includes("(1)") && caras_dado == 20)
        animadorDePartidas(msg, "PIFIA");

    return string;
}

// Si las funciones anteriores eran para D&D o juegos de dados normales esta función será en concreto para jugar a Crónicas de las Tinieblas
function generadorTiradasTinieblas(numero_dados, tipo_especial) {
    let string = "";

    while (numero_dados > 0) {
        let tirada = random(10);
        string += "\\[" + tirada + "\] ";
        if (tirada == 10 && tipo_especial != "10LESS")
            numero_dados++;
        numero_dados--;
    }

    return string;
}

// Esta función se encarga de sumar todas las tiradas de dados que hemos generado
function cuenta(string) {
    // Primero reemplazamos para esta función los corchetes por paréntesis, ya que generan errores si no lo hacemos. Usamos un bucle ya que da problemas el replaceAll
    while (string.includes("[") && string.includes("]")) {
        string = string.replace("\\[", "(").replace("]", ")");
    }

    // En caso de haber usado las tiradas especiales de ventaja o desventaja eliminaremos la tirada que no nos interesa
    if(string.includes("||"))
    {
        while (string.includes("||")) {
            let posicion = string.indexOf("|");

            if (string[string.indexOf("|") - 1] == "*") {
                while (string[posicion] != ")") {
                    posicion++;
                }
                string = string.replace(string.substring(string.indexOf("|") - 1, posicion), "").replace("*", "");
            }
            else {
                while (string[posicion] != "(") {
                    posicion--;
                }
                string = string.replace(string.substring(posicion + 1, string.indexOf("|") + 3), "").replace("*", "");
            }
        }
    }

    // Por último, una vez depurado el string retornamos el resultado de todas las operaciones
    return eval(string);
}

// Creamos la función para lanzar dados usando números aleatorios. Esta función será la que se llamará en primer lugar cuando nuestro bot reciba el comando oportuno
function tiradaDados(msg) {
    let string = msg.text.toLowerCase().replace("/", "");   // Recibe la cadena de texto pasada a minúsculas y elimina el /
    let numero_dados;                                       // Recibirá el número de dados
    let caras_dado;                                         // Servirá para saber el número de caras de cada dado

    // Si hay una x en el texto del mensaje repetimos la secuencia tantas veces como nos indiquen con recursividad
    if (string.includes("x")) {
        let parts = string.split("x");
        if (!isNaN(parts[1]) && parseInt(parts[1]) < 101) {
            while (parseInt(parts[1]) > 0) {
                msg.text = parts[0];
                tiradaDados(msg);
                parts[1] = parseInt(parts[1]) - 1;
            }
            return;
        }
    }

    // Miramos que en la cadena de texto haya caracteres 'd', 'h' o 'l' (haciendo referencia a "dice", "high" y "low"). Por cada uno que haya habrá una tirada diferente
    while (string.includes("d") || string.includes("h") || string.includes("l")) {
        numero_dados = 1;
        // Creamos la variable letra que tomará el valor de d, h o l, según corresponda
        let letra;
        // Creamos una variable llamada posicion que la utilizaremos para saber el número de dados y el número de caras de cada dado
        let posicion;

        if (string.includes("d"))
            letra = "d";
        else if (string.includes("h"))
            letra = "h";
        else if (string.includes("l"))
            letra = "l";

        // Damos el valor a la variable posición del lugar anterior al que se encuentra la letra del comando
        posicion = string.indexOf(letra) - 1;

        // Comprobamos si antes de la letra que indica el tipo de tirada hay un número (que expresaría la cantidad de dados de ese tipo a tirar)
        while (posicion >= 0 && !isNaN(string[posicion]))
            posicion--;
        
        // En caso de que la posición haya cambiado, es decir, que haya un número antes de la letra del comando asignamos su valor a numero_dados. En caso contrario seguirá valiendo 1
        if (posicion != string.indexOf(letra) - 1){
            if (isNaN(string[posicion]))
                posicion++;
            numero_dados = parseInt(string.substring(posicion, string.indexOf(letra)));   // Obtenemos el número de dados (por defecto será 1)
        }

        // Reasignamos el valor a posición. En este caso tomará el valor posterior a la letra para obtener el número de caras del dado a tirar
        posicion = string.indexOf(letra) + 1;

        while (posicion < string.length && !isNaN(string[posicion]))
            posicion++;
        if (posicion != string.indexOf(letra) + 1){
            caras_dado = parseInt(string.substring(string.indexOf(letra) + 1, posicion))      // Obtenemos el número de caras del dado
        }
        else
            return;
        // Si falla el proceso finaliza la función ya que no hay valor por defecto para caras_dado

        // Creamos un condicional para la d o el resto, ya que las funciones a llamar serán diferentes
        if (letra == "d") {
            if (string.includes(numero_dados + letra + caras_dado))
                string = string.replace(numero_dados + letra + caras_dado, generadorTiradasStandar(numero_dados, caras_dado, msg));
            else
                string = string.replace(letra + caras_dado, generadorTiradasStandar(numero_dados, caras_dado, msg));
        }
        else {
            if (string.includes(numero_dados + letra + caras_dado))
                string = string.replace(numero_dados + letra + caras_dado, generadorTiradasEspeciales(letra, numero_dados, caras_dado, msg));
            else
                string = string.replace(letra + caras_dado, generadorTiradasEspeciales(letra, numero_dados, caras_dado, msg));
        }    
    }

    // Por último, tras asegurarnos de que no ha habido errores mandamos el mensaje al usuario con el formato deseado y la cuenta final de las operaciones de los dados
    if (string != ""){
        try {
            bot.sendMessage(msg.chat.id, "@" + msg.from.username + "\n🎲 " + string + " = *" + cuenta(string) + "*", {parse_mode: "Markdown"});
        } 
        // En caso de error mandaremos un mensaje de ayuda al usuario
        catch {
            bot.sendMessage(msg.chat.id, "Usa /help o /ayuda si necesitas información sobre el bot.");
        }
    }
}

// Creamos una función también para las tiradas en específico de las partidas Crónicas de las Tinieblas. Será llamada con el comando desde el chat con el bot
function tiradaDadosTinieblas(msg) {
    let numero_dados = msg.text.toLowerCase().replace("/", "").replace("w", "");    // Recibe la cadena de texto pasada a minúsculas y elimina el /w
    let string ;            // Recibirá la secuencia de tiradas
    let resultado_tirada;   // Obtendrá si la tirada es un acierto o un fallo
    let exitos = 0;         // Para el número de aciertos
    let tipo_especial;      // Para tiradas especiales

    // Primero vemos si se trata de una tirada especial
    if (numero_dados.includes("r")) {
        numero_dados = numero_dados.replace("r", "");
        tipo_especial = "ROTE";
        // Esta es una tirada especial en este sistema de juego. Equivaldría a la ventaja en otros sistemas y consiste en que los fallos se vuelven a tirar una única vez
    }
    else if (numero_dados.includes("l")) {
        numero_dados = numero_dados.replace("l", "");
        tipo_especial = "10LESS";
        // esta es una tirada especial en este sistema de juego. Hace que las tiradas en las que obtenemos el valor de 10 no se repitan
    }

    // Tratamos de obtener el número de dados y lo convertimos a un int
    try {
        numero_dados = parseInt(numero_dados);
    }
    // En caso de error mandaremos un mensaje de ayuda al usuario y dejamos de reproducir la función
    catch {
        bot.sendMessage(msg.chat.id, "Usa /help o /ayuda si necesitas información sobre el bot.");
        return;
    }

    // Ponemos un condicional para tiradas especiales de w0 en la que solo se tira un dado y solo cuenta como acierto si sale un 10
    if (numero_dados == 0) {
        string =   "\\[" + random(10) + "\] ";
        if (string.includes("10"))
            resultado_tirada = "\n*¡Acierto!*🎉";
        else
            resultado_tirada = "\n*¡Fallo!*💩"
        bot.sendMessage(msg.chat.id, "@" + msg.from.username + "\n🎲 " + string + resultado_tirada, {parse_mode: "Markdown"});
        return;
    }

    // Damos el valor al string de todas las tiradas
    string = generadorTiradasTinieblas(numero_dados, tipo_especial);

    // En caso de ser tirada Rote añadimos al string una tirada por cada fallo. Debemos especificar el valor de los fallos ya que pasarlo a int y compararlo daba error
    if (tipo_especial == "ROTE"){
        let counter = 0;
        for (let i = 0; i < string.length; i++) {
            if((string[i] == "1" && string[i + 1] != "0") || string[i] == "2" || string[i] == "3" || string[i] == "4" || string[i] == "5" || string[i] == "6" || string[i] == "7")
                counter++;
        }
        string += generadorTiradasTinieblas(counter, tipo_especial);
    }

    // Ya casi terminando recorremos el string, contabilizando el número de éxitos en las tiradas (valores de 8, 9 ó 10)
    for (i = 0; i < string.length; i++) {
        if (string[i] == "8" || string[i] == "9" || (string[i] == "1" && string[i + 1] == "0"))
        {
            exitos++;
            resultado_tirada = "\n*¡Acierto!*🎉";
        }
    }

    if (exitos == 0)
        resultado_tirada = "\n*¡Fallo!*💩"

    // Y por último mandamos un mensaje al usuario con su tirada, el número de éxitos y el resultado con el formato elegido
    bot.sendMessage(msg.chat.id, "@" + msg.from.username + "\n🎲 " + string + "\n*Exitos:* " + exitos + resultado_tirada, {parse_mode: "Markdown"});
}


// * * * COMANDOS DEL BOT * * *

// Comando bienvenida
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "Hola, bienvenido a su bot para dados de D&D, " + msg.from.first_name + "❤");    
});

// Comando para realizar operaciones
bot.onText(/\/calc/, (msg) => {
    try {
        bot.sendMessage(msg.chat.id, "Resultado: " + eval(msg.text.substring(5, msg.text.length)));    
    }
    catch {
        bot.sendMessage(msg.chat.id, "La función calculadora solo admite números. Escriba /calc seguido de operaciones con solo números.");
    }
});


// Esta función lee todo el texto del chat y actúa si nos interesa
bot.on('message', (msg) => {
    // En caso de que en el chat se escriba como primer caracter "/" y se escriba una 'w' se activará la función tiradaDadosTinieblas
    if (msg.text[0] == "/" && msg.text.toLowerCase().includes("w"))
        tiradaDadosTinieblas(msg);
    // En caso de que en el chat se escriba como primer caracter "/" y se escriba una 'd', 'h' o 'l' se activará la función tiradaDados
    else if (msg.text[0] == "/" && (msg.text.toLowerCase().includes("d") || msg.text.toLowerCase().includes("h") || msg.text.toLowerCase().includes("l"))) { 
        tiradaDados(msg);
    }
});

// Comando ayuda. Se activa escribiendo "/ayuda" o "/help"
bot.onText(/\/help|\/ayuda/, (msg) => {
    bot.sendMessage(msg.chat.id, "*COMANDOS DEL BOT*\n\n1. Usa /d seguido del número de caras de un dado "
    +"para lanzar dicho dado. Puedes poner operaciones de sumas y restas, pero si quieres multiplicar o dividir "
    +"deberás usar el comando /calc.\n\n2. Usa /h o /l para tirar con ventaja o desventaja (_high_ o _low_). El bot "
    +"automáticamente tirará 2 dados y se quedará con el mayor o menor, según corresponda.\n\n3. Después de la tirada "
    +"puedes poner x seguido de un número para repetir la tirada especificada tantas veces como quieras.\n\nUn ejemplo "
    +"de un comando podría ser:\n/h20+d4+3x2\n\n4. Para realizar operaciones usa el comando /calc seguido de la operación."
    +" Deberá de ser solo números y operaciones sin letras.\n\n5. Usa el comando /w para realizar tiradas de Mundo de las "
    +"Tinieblas. Pon el número de dados a lanzar y el bot automáticamente pondrá si tiene éxito tu tirada. También admite "
    +"tiradas Rote y 10Less, añadiendo a la w una r o una l respectivamente."

    +"\n\n\nPara cualquier consulta escribe a *@RubenPal*.",
    {parse_mode : "Markdown"});
});


/*

    Bot disponible en telegram ( @DadillosBot )
    Creado por: Rubén Palomo Fontán
    Contacto: ruben.palomof@gmail.com
 
 */
