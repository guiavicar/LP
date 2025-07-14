import React, { useState } from 'react';
import './App.css';

function App() {
  // --- Novos Estados ---
  // 'selectedFile' vai guardar o arquivo que o usuário escolheu. Começa como nulo.
  const [selectedFile, setSelectedFile] = useState(null);
  // 'asciiArt' continua guardando o resultado.
  const [asciiArt, setAsciiArt] = useState('');
  // 'isLoading' para mostrar um feedback ao usuário enquanto a conversão acontece.
  const [isLoading, setIsLoading] = useState(false);

  // --- Novas Funções ---

  // Esta função é chamada QUANDO o usuário seleciona um arquivo no input.
  const handleFileChange = (event) => {
    // Pegamos o primeiro arquivo da lista de arquivos selecionados.
    const file = event.target.files[0];
    if (file) {
      console.log('Arquivo selecionado:', file.name);
      setSelectedFile(file);
      setAsciiArt(''); // Limpa a arte anterior ao selecionar um novo arquivo
    }
  };

  // Esta função é chamada QUANDO o usuário clica no botão "Converter".
  const handleUpload = () => {
    // Verificamos se um arquivo foi realmente selecionado.
    if (!selectedFile) {
      alert('Por favor, selecione um arquivo primeiro!');
      return;
    }

    console.log('Iniciando upload...');
    setIsLoading(true); // Ativa o estado de "carregando"

    // 'FormData' é um objeto especial para empacotar dados de formulário,
    // incluindo arquivos, para serem enviados em uma requisição.
    const formData = new FormData();
    // Adicionamos nosso arquivo ao FormData. A chave 'image' é importante,
    // pois o backend vai procurar por um campo com este nome.
    formData.append('image', selectedFile);

    // O 'fetch' agora é do tipo 'POST' e envia o 'formData' no corpo.
    fetch('http://127.0.0.1:8080/api/convert', {
      method: 'POST',
      body: formData,
      // **Importante:** Não defina o 'Content-Type' aqui! O navegador
      // fará isso automaticamente com o 'boundary' correto para multipart/form-data.
    })
    .then(response => response.text())
    .then(data => {
      console.log('Arte ASCII recebida!');
      setAsciiArt(data); // Mostra o resultado
    })
    .catch(error => {
      console.error('Erro no upload:', error);
      alert('Ocorreu um erro ao enviar a imagem.');
    })
    .finally(() => {
      setIsLoading(false); // Desativa o estado de "carregando", com sucesso ou erro
    });
  };

  // --- A Aparência do Componente (JSX) ---
  return (
    <div className="App">
      <header className="App-header">
        <h1>Conversor para Arte ASCII</h1>
        
        {/* Input para o usuário escolher o arquivo.
            Aceita apenas os formatos de imagem mais comuns.
            Ao mudar, chama 'handleFileChange'. */}
        <input 
          type="file" 
          onChange={handleFileChange} 
          accept="image/png, image/jpeg, image/gif"
        />

        {/* Botão para iniciar a conversão.
            Ele fica desabilitado se não houver arquivo selecionado ou se estiver carregando. */}
        <button onClick={handleUpload} disabled={!selectedFile || isLoading}>
          {isLoading ? 'Convertendo...' : 'Converter'}
        </button>

        <h2>Resultado:</h2>
        <pre>{asciiArt}</pre>
      </header>
    </div>
  );
}

export default App;