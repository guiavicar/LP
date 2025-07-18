export const projectInfo = {
    title: 'Wiki Conversor de Imagem ASCII',
    description: `
    Uma aplicação web full-stack que permite fazer upload de imagens (PNG, JPEG e GIF) 
    e convertê-las em arte ASCII de forma interativa. O backend é escrito em Rust, 
    usando Actix-Web para servir requisições e crates de processamento de imagem; 
    o frontend é construído em React com uma interface simples e responsiva para 
    ajuste de parâmetros e visualização do resultado.
    \n\n
    Funcionalidades principais:

      -  Upload de imagens nos formatos comuns (PNG, JPEG, GIF).

      -  Controle dinâmico da largura da arte ASCII via slider.

      -  Conversão e renderização em tempo real, com feedback rápido.

      -  Visualização em modal dedicado, incluindo opção de copiar o ASCII.
    \n\n
    Stack Tecnológica:
    \n\n
      -  Actix-Web para servidor HTTP assíncrono.

      -  Crate image (com suporte a GIF) para decodificação, redimensionamento, ajuste de contraste e tons de cinza.

      -  Actix-Multipart para uploads e Actix-CORS para configuração de política de origem.
    \n\n
    Frontend (React):
    \n\n
      -  React + JavaScript (ES6+) para UI.

      -  CSS modular e web-vitals para monitoramento de performance. 
    `,
    videoUrl: 'https://www.youtube-nocookie.com/embed/1w6aUvnH2_w',
    repoUrl: 'https://github.com/guiavicar/LP',
    linkWiki: 'https://github.com/guiavicar/LP/wiki'
};
