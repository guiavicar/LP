Conversor de Imagem para Arte ASCII

Este projeto é uma aplicação web que permite aos usuários fazer upload de imagens e convertê-las em arte ASCII. Ele é composto por um backend robusto construído com Rust e Actix-Web, e um frontend interativo desenvolvido com React.
🚀 Funcionalidades

    Upload de Imagem: Faça upload de imagens nos formatos comuns (PNG, JPEG, GIF).

    Ajuste de Largura: Controle a largura da arte ASCII gerada através de um slider.

    Conversão em Tempo Real: O backend processa a imagem e retorna a arte ASCII.

    Visualização Interativa: Exibe a arte ASCII gerada em um modal dedicado no frontend.

    Informações do Projeto: Um modal informativo sobre o projeto.

🛠️ Tecnologias Utilizadas
Backend (Rust)

    Rust: Linguagem de programação de sistemas focada em segurança, velocidade e concorrência.

    Actix-Web: Um framework web poderoso e rápido para Rust.

    image crate: Biblioteca para manipulação de imagens (redimensionamento, ajuste de contraste, conversão para tons de cinza).

    actix-multipart: Para lidar com uploads de arquivos multipart/form-data.

    actix-cors: Para gerenciar as políticas de Cross-Origin Resource Sharing (CORS).

Frontend (React)

    React: Biblioteca JavaScript para construção de interfaces de usuário.

    JavaScript (ES6+): Linguagem de programação para a lógica do frontend.

    CSS: Para estilização e layout da interface.

    web-vitals: Para medição de métricas de performance web.

⚙️ Como Rodar o Projeto

Para rodar este projeto, você precisará ter o Rust/Cargo e o Node.js/npm (ou Yarn) instalados em sua máquina.
Pré-requisitos

    Rust e Cargo: Siga as instruções em rustup.rs para instalar.

    Node.js e npm/Yarn: Baixe em nodejs.org ou use um gerenciador de versões como NVM.

1. Backend (Rust)

    Navegue até o diretório do backend:

    cd seu-projeto/lp-backend # Assumindo que o main.rs está aqui

    Compile e execute o servidor:

    cargo run

    O servidor será iniciado em http://127.0.0.1:8080. Você verá uma mensagem no console: 🚀 Servidor backend rodando em http://127.0.0.1:8080.

2. Frontend (React)

    Navegue até o diretório do frontend:

    cd seu-projeto/lp-frontend # Assumindo que os arquivos React estão aqui

    Instale as dependências:

    npm install # ou yarn install

    Inicie a aplicação React:

    npm start # ou yarn start

    A aplicação será aberta automaticamente em seu navegador, geralmente em http://localhost:3000.

Observação: Certifique-se de que o backend Rust esteja rodando antes de iniciar o frontend, pois o frontend tentará se comunicar com ele para a conversão de imagens.
🖥️ Uso da API (Backend)

O backend expõe um único endpoint para a conversão de imagens:

    URL: http://127.0.0.1:8080/api/convert

    Método HTTP: POST

    Content-Type: multipart/form-data

Parâmetros da Requisição

Nome do Campo
	

Tipo
	

Descrição

image
	

File
	

O arquivo de imagem a ser convertido (PNG, JPEG, GIF).

width
	

String
	

A largura desejada para a arte ASCII (ex: "200"). Padrão: "200".
Exemplo de Requisição (JavaScript - como no App.js)

const formData = new FormData();
formData.append('image', seuArquivoDeImagem); // 'seuArquivoDeImagem' é um objeto File
formData.append('width', '200'); // Ou o valor do slider

fetch('http://127.0.0.1:8080/api/convert', {
  method: 'POST',
  body: formData,
})
.then(response => {
  if (!response.ok) {
    throw new Error('Falha na resposta do servidor.');
  }
  return response.text(); // A resposta é a string da arte ASCII
})
.then(asciiArt => {
  console.log(asciiArt);
})
.catch(error => {
  console.error('Erro:', error);
});

📂 Estrutura de Arquivos Principais

.
├── lp-backend/
│   └── src/
│       └── main.rs             # Código do servidor Rust (Actix-Web) e lógica de conversão
├── lp-frontend/
│   ├── public/
│   │   └── index.html          # Arquivo HTML principal do React
│   ├── src/
│   │   ├── App.js              # Componente principal do React, lógica de UI e comunicação com backend
│   │   ├── App.css             # Estilos CSS para o componente App.js
│   │   ├── index.js            # Ponto de entrada da aplicação React
│   │   ├── index.css           # Estilos CSS globais
│   │   ├── projectInfo.js      # Informações do projeto (descrição, URL de vídeo)
│   │   ├── reportWebVitals.js  # Relatório de métricas de performance web
│   │   └── setupTests.js       # Configuração de testes Jest
│   └── package.json            # Dependências e scripts do frontend
└── README.md                   # Este arquivo

🤝 Contribuição

Contribuições são bem-vindas! Se você tiver ideias para melhorias, novas funcionalidades ou encontrar bugs, sinta-se à vontade para abrir uma issue ou enviar um pull request.
📄 Licença

Este projeto está licenciado sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.