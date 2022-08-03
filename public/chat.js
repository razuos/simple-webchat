// Pega o nome do usuário, forçando caso ele cancele o prompt.
let username = ""
while (username == "" || username == null) {
    username = prompt('Insira seu nome de usuário');
}

// Cria o cliente websocket
const ws = new WebSocket(`ws://localhost:8080`);
ws.binaryType = "blob";

// Assim que o websocket conectar com o servidor, enviar um handshake para o servidor contendo o nome do usuário.
ws.addEventListener("open", () => {
    const payload = JSON.stringify({ event: 'handshake', name: username });
    console.log('websocket opened, sending handshake')
    ws.send(payload);
});

// Assim que o websocket desconectar, remover todas as mensagens da tela, mostrar uma mensagem e desabilitar o formulário.
ws.addEventListener("close", () => {
    console.log('websocket closed');

    // Remove todas mensagens
    for (div of document.querySelectorAll(".message")) {
        div.parentNode.removeChild(div)
    }

    // Cria mensagem de desconexão
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message');
    msgDiv.innerHTML = `Desconectado`;

    // Desabilita formulário
    document.getElementById('messages').appendChild(msgDiv);
    document.getElementById('textInput').disabled = true;
    document.getElementById('textInput').placeholder = 'Desconectado';
    document.getElementById('textSend').disabled = true;
});

// Toda vez que receber uma mensagem, limitar o número de mensagens na tela e mostrar a mensagem atual na tela.
ws.onmessage = (message) => {
    // Retorna as mensagens já mostradas na tela
    const previousMessageDivs = document.querySelectorAll(".message");

    // Se a quantidade de mensagens na tela for maior que 10, remover a mais antiga.
    if (previousMessageDivs.length >= 10) {
        let div = previousMessageDivs[0];
        div.parentNode.removeChild(div);
    }

    // Mostrar nova mensagem
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    payload = JSON.parse(message.data);
    messageDiv.innerHTML = `${payload.timestamp}: (${payload.author}) -> ${payload.message}`;
    document.getElementById('messages').appendChild(messageDiv);
}

const form = document.getElementById('textForm');

// Toda vez que o formulário for enviado, seja por enter ou clicando no botão, enviar a mensagem para o servidor.
form.addEventListener('submit', (event) => {
    event.preventDefault();
    const textInput = document.getElementById('textInput');

    const payload = JSON.stringify({ event: 'message', message: textInput.value });

    // Se já estiver conectado, enviar, se não estiver, mandar uma mensagem no console.
    if (ws.readyState == ws.OPEN) {
        ws.send(payload);
    } else {
        console.log('ignoring message send because websocket is disconnected');
    }

    // Limpar texto da caixa de texto do formulário.
    textInput.value = '';
})