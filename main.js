const websocket = require('ws');
const express = require('express');

// Cria servidor websocket
const wss = new websocket.Server({ noServer: true });

// Criar servidor express para servir o html, javascript e css.
const app = express();

// Configurar para servir todos arquivos na pasta 'public';
app.use(express.static('public'))

// Assim que um cliente conectar
wss.on('clientConnected', (ws, req) => {
    console.log(`user connected, ip: ${req.socket.remoteAddress}`);

    // Registra a thread que lidará com as mensagens do cliente à conexão.
    ws.on('message', (data) => {
        console.log('received data: ', data.toString());
        const payload = JSON.parse(data);

        // Se for um handshake, salvar o nome do usuário nos atributos da conexão, se for uma mensagem normal, enviar para todos outros clientes.
        if (payload.event == 'handshake') {
            ws.name = payload.name;
        } else {
            wss.clients.forEach((client) => {
                if (client.readyState == websocket.OPEN) {
                    client.send(JSON.stringify({ event: 'message', timestamp: new Date(), author: ws.name, message: payload.message }))
                }
            })
        }
    })
})

// Inicia aplicação express, retornando uma instancia de httpServer.
const httpServer = app.listen(8080, () => console.log('listening on port 8080, http://localhost:8080'));

// Registra o handler para fazer o upgrade da conexão http para uma conexão websocket.
httpServer.on('upgrade', (req, socket, head) => {
    console.log('upgrading to a websocket connection')
    wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit('clientConnected', ws, req)
    })
})
