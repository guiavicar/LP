export const projectInfo = {
    title: 'Wiki Conversor de Imagem ASCII',
    description: `
    Este projeto combina um backend em Rust usando Actix-Web com um frontend
    React para transformar qualquer imagem enviada pelo usuário em arte ASCII 
    exibida no navegador. O servidor expõe apenas um POST /api/convert: ele 
    recebe um upload multipart, extrai a largura (padrão 200) e os bytes da imagem, 
    carrega-a com a crate image, passa por um pipeline que ajusta contraste, 
    redimensiona mantendo proporção, converte a tons de cinza e mapeia cada pixel 
    para um caractere da paleta “#BRD!*+=-:. ”, devolvendo texto/plain. 
    Middleware CORS libera o domínio do frontend e o HttpServer roda em 127.0.0.1:8080.
    \n\n
    As importações centrais cobrem actix_web (rotas, respostas, servidor), 
    actix_cors para CORS, actix_multipart para uploads, futures_util::StreamExt 
    para iterar chunks, image para manipulação de pixels e std::str::FromStr 
    para parsing. 
    \n\n
    Toda a lógica pesada vive em cinco funções: resize_image (filtro Lanczos3),
    adjust_contrast ((val-128)*factor+128 por canal), grayify_image (Luma8), 
    pixels_to_ascii (intensidade → caractere) e frame_to_ascii (pipeline completo).
    \n\n
    No lado do cliente, App.js mantém estados de arquivo, resultado ASCII, largura e 
    loading; monta um FormData, faz fetch e exibe “Convertendo…” até receber o <pre> com a arte. 
    Dois modais controlam a experiência: um de conversão e outro “Sobre o Projeto”, 
    alimentado por projectInfo.js que traz este texto e um vídeo YouTube nocookie. 
    App.css define plano de fundo, centraliza conteúdo, estiliza botões, modais e slider; 
    index.js bootstrapa com ReactDOM.createRoot; index.css aplica resets; 
    App.test.js garante renderização básica; 
    reportWebVitals mede métricas; 
    setupTests habilita matchers jest-dom.
    \n\n
    Em suma, poucos arquivos entregam um fluxo completo: o usuário solta uma foto, 
    o Rust devolve texto, e o React mostra instantaneamente a imagem convertida em caracteres, 
    tudo num ambiente leve e fácil de entender. 
    `,
    videoUrl: 'https://www.youtube-nocookie.com/embed/X874raPe-_4',
    repoUrl: 'https://github.com/guiavicar/LP'
};
