// Importamos la librería node-telegram-bot-api 
const TelegramBot = require('node-telegram-bot-api');

// Creamos una constante que guarda el Token de nuestro Bot de Telegram que previamente hemos creado desde el bot @BotFather
const token = '5117080674:AAHQ4hdj7AkVxAoHmhZbILkjVZy6FoDvCl0';

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

// Creamos la función para lanzar dados usando números aleatorios
async function tiradaDados(msg, string){
    let operacion;          // Permitirá realizar las operaciones con eval haciendo replace de algunos elementos del string
    let cuenta;             // Permiritá mostrar el resultado final
    let tirada;             // Recibirá el número aleatorio que nos interese
    let tirada2;            // Para cuando se tira con ventaja o con desventaja
    let tipoTirada;         // Para identificar cuando se trate de una tirada de ventaja o desventaja
    let critico_pifia;      // Para saber si hubo crítico o pifia

    while (string.includes("d20")) {
        tirada = random(20);
        string = string.replace("d20", '[' + tirada + ']');

        // Añadimos mensajes con emoticonos para hacerlo más visual
        if(tirada==20){
            critico_pifia = "CRITICO";
        }

        else if(tirada==1){
            critico_pifia = "PIFIA";
        }

        tipoTirada = "NORMAL";
    }

    while (string.includes("h20")) {
        tirada = random(20);
        tirada2 = random(20);
        string = string.replace("h20", '([' + tirada + '] || [' + tirada2 + '])');

        // Añadimos mensajes con emoticonos para hacerlo más visual
        if(tirada==20||tirada2==20){
            critico_pifia="CRITICO";
        }

        tipoTirada = "VENTAJA";
    }

    while (string.includes("l20")) {
        tirada = random(20);
        tirada2 = random(20);
        string = string.replace("l20", '([' + tirada + '] || [' + tirada2 + '])');

        // Añadimos mensajes con emoticonos para hacerlo más visual
        if(tirada==1||tirada2==1){
            critico_pifia = "PIFIA";        }

        tipoTirada = "DESVENTAJA";
    }

    // Reemplazamos todos los otros posibles dados por números aleatorios. Usaremos un bucle para evitar repeticiones
    while(string.includes("d2")||string.includes("d10")||string.includes("d12")||string.includes("d8")||string.includes("d6")||string.includes("d4")){
        string = string.replace("d100", "[" + random(100) + "]").replace("d12", "[" + random(12) + "]")
        .replace("d10", "[" + random(10) + "]").replace("d8", "[" + random(8) + "]")
        .replace("d6", "[" + random(6) + "]").replace("d4", "[" + random(4) + "]")
        .replace("d2", "[" + random(2) + "]");
    }
    

    // Pasamos el string al otro string, llamado operación, y realizamos cambios para que sea operable
    if(tipoTirada=="VENTAJA"){
        if(tirada>tirada2){
            operacion = string.replace('[' + tirada + '] || [' + tirada2 + ']', tirada);
        }

        else{
            operacion = string.replace('[' + tirada + '] || [' + tirada2 + ']', tirada2);
        }  
    }

    else if(tipoTirada == "DESVENTAJA"){
        if(tirada<tirada2){
            operacion = string.replace('[' + tirada + '] || [' + tirada2 + ']', tirada);
        }

        else{
            operacion = string.replace('[' + tirada + '] || [' + tirada2 + ']', tirada2);
        } 
    }

    else{
        operacion = string;
    }
    

    // Creamos un bucle para eliminar todos los brackets del string (no deja replaceAll)
    while (operacion.includes("[")) {
        operacion = operacion.replace("[", '').replace("]", "").replace("(", '').replace(")", "");
    }

    // Tenemos en cuenta que quede algún dado de caras no especificadas en el string
    if(operacion.includes("d")){
        bot.sendMessage(msg.chat.id, "No existen dados de las caras especificadas.");
    }

    else{
        // Si no hay ningún error calculamos el resultado y lo almacenamos en la variable cuenta
        cuenta = eval(operacion);

        // Y por último mandamos un mensaje con la tirada, las operaciones y el resultado
        bot.sendMessage(msg.chat.id, "@" + msg.from.username + "\n🎲 " + string +" = " + cuenta);
    }

    if(critico_pifia=="CRITICO"){
        await espera(500);
        bot.sendMessage(msg.chat.id, "💥*¡Crítico!*💥", {parse_mode : "Markdown"})
    }

    else if(critico_pifia=="PIFIA"){
        await espera(500);
        bot.sendMessage(msg.chat.id, "💩 ¡@" + msg.from.username + " tuvo una *pifia*! 💩", {parse_mode : "Markdown"});
    }
}

// Comando bienvenida
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "Hola, bienvenido a su bot para dados de D&D, " + msg.from.first_name + "❤");    
});


// Comandos para tirar dados

// Comando para tiradas normales
bot.onText(/^\/d/, async (msg) => {
    let string = msg.text.substring(1).trim();
    let arrayTiradas;

    if(string.includes("x")){
        arrayTiradas = string.split("x");

        if(arrayTiradas[1]<16){
            for (let i = 0; i < arrayTiradas[1]; i++) {
                tiradaDados(msg, arrayTiradas[0]);
                await espera(200);
            }  
        }
         
        else{
            bot.sendMessage(msg.chat.id, "Demasiadas tiradas, máximo 15.")
        }
    }

    else{
        tiradaDados(msg, string);
    }
});

// Comando para tiradas con ventaja
bot.onText(/^\/h/, async (msg) => {
    let string = msg.text.substring(1).trim();
    let arrayTiradas;

    if(string.includes("x")){
        arrayTiradas = string.split("x");

        if(arrayTiradas[1]<16){
            for (let i = 0; i < arrayTiradas[1]; i++) {
                tiradaDados(msg, arrayTiradas[0]);
                await espera(200);
            }  
        }
         
        else{
            bot.sendMessage(msg.chat.id, "Demasiadas tiradas, máximo 15.")
        }    
    }

    else{
        tiradaDados(msg, string);
    }
});

// Comando para tiradas con desventaja
bot.onText(/^\/l/, async (msg) => {
    let string = msg.text.substring(1).trim();
    let arrayTiradas;

    if(string.includes("x")){
        arrayTiradas = string.split("x");
        
        if(arrayTiradas[1]<16){
            for (let i = 0; i < arrayTiradas[1]; i++) {
                tiradaDados(msg, arrayTiradas[0]);
                await espera(200);
            }  
        }
         
        else{
            bot.sendMessage(msg.chat.id, "Demasiadas tiradas, máximo 15.")
        }
    }

    else{
        tiradaDados(msg, string);
    }
});


// Comando ayuda
bot.onText(/\/help|\/ayuda/, (msg) => {
    bot.sendMessage(msg.chat.id, "*COMANDOS DEL BOT*\n\n1. Usa /d seguido del número de caras de un dado "
    +"para lanzar dicho dado. Puedes poner operaciones de sumas, restas, multiplicaciones y divisiones si "
    +"lo deseas.\n\n2. Usa /h o /l para tirar con ventaja o desventaja (_high_ o _low_). El bot automáticamente "
    +"tirará 2 dados y se quedará con el mayor o menor, según corresponda.\n\n3. Después de la tirada puedes "
    +"poner x seguido de un número para repetir la tirada especificada tantas veces como quieras.\n\nUn ejemplo "
    +"de un comando podría ser:\n/h20+d4+3x2\n\n\nPara cualquier consulta escribe a *@RubenPal*.", 
    {parse_mode : "Markdown"});
});


/*

    Creado por: Rubén Palomo Fontán
    Contacto: ruben.palomof@gmail.com
 
 */