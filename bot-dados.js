// Si quiere probar el bot está disponible en @DadillosBot

// Importamos la librería node-telegram-bot-api 
const { Console, count } = require('console');
const TelegramBot = require('node-telegram-bot-api');

// Creamos una constante que guarda el Token de nuestro Bot de Telegram que previamente hemos creado desde el bot @BotFather
const token = 'TOKEN';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});


// ⚠️ Después de este comentario es donde ponemos la lógica de nuestro bot donde podemos crear los comandos y eventos para darle funcionalidades a nuestro bot


// Importamos función para añadir tiempo de espera a ciertos elementos
const util = require('util');
const espera = util.promisify(setTimeout);

// Creamos la función para generar números aleatorios
function random(numero) {
    return Math.floor(Math.random() * (numero) + 1);
}

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

function generadorTiradasStandar(numero_dados, caras_dado, msg){
    let string = "";
    let tirada;
    if (numero_dados != null && caras_dado != null)
    {
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
    }

    return string;
}

function generadorTiradasEspeciales(tipo, numero_dados, caras_dado, msg) {
    let string = "";
    let tirada;
    let tirada2;

    if (numero_dados != null && caras_dado != null)
    {
        while (numero_dados > 0) {
            // Generamos un número aleatorio por cada tirada
            tirada = random(caras_dado);
            tirada2 = random(caras_dado);
            if ((tipo == "V" && tirada > tirada2) || (tipo == "D" && tirada < tirada2))
                string += "\\[*" + tirada + "*||" + tirada2 + "]";
            else
                string += "\\[" + tirada + "||*" + tirada2 + "*]";

            if (numero_dados != 1)
                string += "+";

            // En caso de tener un crítico o una pifia llamamos al animador de partidas, por darle vidilla
            if (string.includes("*20*") && caras_dado == 20)
                animadorDePartidas(msg, "CRITICO");
            else if (string.includes("*1*") && caras_dado == 20)
                animadorDePartidas(msg, "PIFIA");

            numero_dados--;
        }
    }

    // En caso de tener un crítico o una pifia llamamos al animador de partidas, por darle vidilla
    if (string.includes("(20)") && caras_dado == 20)
        animadorDePartidas(msg, "CRITICO");
    else if (string.includes("(1)") && caras_dado == 20)
        animadorDePartidas(msg, "PIFIA");

    return string;
}

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

function cuenta(string) {
    while (string.includes("[") && string.includes("]")) {
        string = string.replace("\\[", "(").replace("]", ")");
    }

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

    return eval(string);
}

// Creamos la función para lanzar dados usando números aleatorios
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

    // Miramos que en la cadena de texto haya caracteres 'd'. Por cada uno que haya habrá una tirada diferente
    while (string.includes("d")){
        numero_dados = 1;
        // Creamos una variable llamada posicion que la utilizaremos para saber el número de dados y el número de caras de cada dado
        let posicion = string.indexOf("d") - 1;
        while (posicion >= 0 && !isNaN(string[posicion]))
            posicion--;
        if (posicion != string.indexOf("d") - 1){
            if (isNaN(string[posicion]))
                posicion++;
            numero_dados = parseInt(string.substring(posicion, string.indexOf("d")));   // Obtenemos el número de dados (por defecto será 1)
        }
        posicion = string.indexOf("d") + 1;

        while (posicion < string.length && !isNaN(string[posicion]))
            posicion++;
        if (posicion != string.indexOf("d") + 1){
            caras_dado = parseInt(string.substring(string.indexOf("d") + 1, posicion))      // Obtenemos el número de caras del dado
        }
        else
            return;

        // Si falla el proceso finaliza la función ya que no hay valor por defecto para caras_dado
        if (string.includes(numero_dados + "d" + caras_dado))
            string = string.replace(numero_dados + "d" + caras_dado, generadorTiradasStandar(numero_dados, caras_dado, msg));
        else
            string = string.replace("d" + caras_dado, generadorTiradasStandar(numero_dados, caras_dado, msg));
    }

    while (string.includes("h")){
        numero_dados = 1;
        // Creamos una variable llamada posicion que la utilizaremos para saber el número de dados y el número de caras de cada dado
        let posicion = string.indexOf("h") - 1;
        while (posicion >= 0 && !isNaN(string[posicion]))
            posicion--;
        if (posicion != string.indexOf("h") - 1){
            if (isNaN(string[posicion]))
                posicion++;
            numero_dados = parseInt(string.substring(posicion, string.indexOf("h")));   // Obtenemos el número de dados (por defecto será 1)
        }
        posicion = string.indexOf("h") + 1;

        while (posicion < string.length && !isNaN(string[posicion]))
            posicion++;
        if (posicion != string.indexOf("h") + 1){
            caras_dado = parseInt(string.substring(string.indexOf("h") + 1, posicion))      // Obtenemos el número de caras del dado
        }
        else
            return;
        // Si falla el proceso finaliza la función ya que no hay valor por defecto para caras_dado

        if (string.includes(numero_dados + "h" + caras_dado))
            string = string.replace(numero_dados + "h" + caras_dado, generadorTiradasEspeciales("V", numero_dados, caras_dado, msg));
        else
            string = string.replace("h" + caras_dado, generadorTiradasEspeciales("V", numero_dados, caras_dado, msg));
    }

    while (string.includes("l")){
        numero_dados = 1;
        // Creamos una variable llamada posicion que la utilizaremos para saber el número de dados y el número de caras de cada dado
        let posicion = string.indexOf("l") - 1;
        while (posicion >= 0 && !isNaN(string[posicion]))
            posicion--;
        if (posicion != string.indexOf("l") - 1){
            if (isNaN(string[posicion]))
                posicion++;
            numero_dados = parseInt(string.substring(posicion, string.indexOf("l")));   // Obtenemos el número de dados (por defecto será 1)
        }
        posicion = string.indexOf("l") + 1;

        while (posicion < string.length && !isNaN(string[posicion]))
            posicion++;
        if (posicion != string.indexOf("l") + 1){
            caras_dado = parseInt(string.substring(string.indexOf("l") + 1, posicion))      // Obtenemos el número de caras del dado
        }
        else
            return;
        // Si falla el proceso finaliza la función ya que no hay valor por defecto para caras_dado

        if (string.includes(numero_dados + "l" + caras_dado))
            string = string.replace(numero_dados + "l" + caras_dado, generadorTiradasEspeciales("D", numero_dados, caras_dado, msg));
        else
            string = string.replace("l" + caras_dado, generadorTiradasEspeciales("D", numero_dados, caras_dado, msg));
    }

    if (string != ""){
        try {
            bot.sendMessage(msg.chat.id, "@" + msg.from.username + "\n🎲 " + string + " = *" + cuenta(string) + "*", {parse_mode: "Markdown"});
        } catch (error) {
            bot.sendMessage(msg.chat.id, "Usa /help o /ayuda si necesitas información sobre el bot.");
        }
    }
}

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
    }
    else if (numero_dados.includes("l")) {
        numero_dados = numero_dados.replace("l", "");
        tipo_especial = "10LESS";
    }

    // Tratamos de obtener el número de dados y lo convertimos a un int
    try {
            numero_dados = parseInt(numero_dados);
        } catch (error) {
            bot.sendMessage(msg.chat.id, "Usa /help o /ayuda si necesitas información sobre el bot.");
            return;
        }

    // Ponemos un condicional para tiradas especiales
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

    if (tipo_especial == "ROTE"){
        let counter = 0;
        for (let i = 0; i < string.length; i++) {
            if((string[i] == "1" && string[i + 1] != "0") || string[i] == "2" || string[i] == "3" || string[i] == "4" || string[i] == "5" || string[i] == "6" || string[i] == "7")
                counter++;
        }
        string += generadorTiradasTinieblas(counter, tipo_especial);
    }

    for (i = 0; i < string.length; i++) {
        if (string[i] == "8" || string[i] == "9" || (string[i] == "1" && string[i + 1] == "0"))
        {
            exitos++;
            resultado_tirada = "\n*¡Acierto!*🎉";
        }
    }

    if (exitos == 0)
        resultado_tirada = "\n*¡Fallo!*💩"

    bot.sendMessage(msg.chat.id, "@" + msg.from.username + "\n🎲 " + string + "\n*Exitos:* " + exitos + resultado_tirada, {parse_mode: "Markdown"});
}

// Comando bienvenida
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "Hola, bienvenido a su bot para dados de D&D, " + msg.from.first_name + "❤");    
});

// Comando para calcular
bot.onText(/\/calc/, (msg) => {
    bot.sendMessage(msg.chat.id, "Resultado: " + eval(msg.text.substring(5, msg.text.length)));    
});


// Esta función lee todo el texto del chat y actúa si nos interesa
bot.on('message', (msg) => {
    if (msg.text[0] == "/" && msg.text.toLowerCase().includes("w"))
        tiradaDadosTinieblas(msg);
    else if (msg.text[0] == "/" && (msg.text.toLowerCase().includes("d") || msg.text.toLowerCase().includes("h") || msg.text.toLowerCase().includes("l"))) { 
        tiradaDados(msg);
    }
});

// Comando ayuda
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

    Creado por: Rubén Palomo Fontán
    Contacto: ruben.palomof@gmail.com
 
 */
