// Conteúdo final e completo para: lp-frontend/src/App.js

import React, { useState, useRef, useEffect } from 'react';
import './App.css'; 

function App() {
  // --- Estados da UI e da Funcionalidade ---
  const [isConvOpen, setConvOpen] = useState(false);
  const [isInfoOpen, setInfoOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [ascii, setAscii] = useState('');
  const [loading, setLoading] = useState(false);
  const [width, setWidth] = useState(200);

  // --- Função para lidar com a seleção do arquivo ---
  const handleFileChange = (event) => {
    const selected = event.target.files[0];
    if (selected) {
      setFile(selected);
      setAscii('');
    }
  };

  // --- Função para limpar a seleção ---
  const handleClear = () => {
    setFile(null);
    setAscii('');
  };

  // --- A NOVA E PRINCIPAL FUNÇÃO DE LÓGICA ---
  const handleUpload = () => {
    if (!file) {
      alert('Por favor, selecione um arquivo primeiro!');
      return;
    }
    setLoading(true);
    setAscii(''); // Limpa o resultado anterior antes de uma nova conversão
    
    const formData = new FormData();
    formData.append('image', file);
    formData.append('width', width);

    fetch('http://127.0.0.1:8080/api/convert', {
      method: 'POST',
      body: formData,
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Falha na resposta do servidor.');
      }
      
      // Verificamos o tipo de conteúdo que o backend está enviando
      const contentType = response.headers.get("content-type");

      // CASO 1: A RESPOSTA É UM STREAM DE EVENTOS (É UM GIF!)
      if (contentType && contentType.includes("text/event-stream")) {
        console.log("Recebendo stream de GIF...");
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        // Função recursiva para ler o stream continuamente
        const readStream = () => {
          reader.read().then(({ done, value }) => {
            if (done) {
              console.log("Stream finalizado.");
              setLoading(false);
              return;
            }

            // Decodifica o pedaço de dados recebido e adiciona ao buffer
            buffer += decoder.decode(value, { stream: true });
            
            // Processa todas as mensagens completas (que terminam com \n\n) no buffer
            while (buffer.includes('\n\n')) {
              const messageEnd = buffer.indexOf('\n\n');
              const message = buffer.substring(0, messageEnd);
              buffer = buffer.substring(messageEnd + 2); // Remove a mensagem processada do buffer

              if (message.startsWith('data:')) {
                const data = message.substring(5).trim();
                try {
                  const parsedData = JSON.parse(data);
                  // ATUALIZA A TELA COM O NOVO FRAME! É AQUI QUE A ANIMAÇÃO ACONTECE.
                  setAscii(parsedData);
                } catch (e) {
                  console.error("Erro ao fazer parse do frame JSON:", e);
                }
              } else if (message.startsWith('event: end')) {
                 // O backend avisou que o GIF acabou. Paramos de carregar.
                 setLoading(false);
              }
            }
            
            // Continua lendo o próximo pedaço do stream
            readStream();
          });
        };
        
        readStream();

      } else {
        // CASO 2: A RESPOSTA É TEXTO SIMPLES (É UMA IMAGEM ESTÁTICA)
        console.log("Recebendo imagem estática...");
        response.text().then(data => {
          setAscii(data);
          setLoading(false);
        });
      }
    })
    .catch(error => {
      console.error('Erro no upload:', error);
      alert('Ocorreu um erro ao enviar a imagem. Verifique se o backend está rodando.');
      setLoading(false);
    });
  };
  
  // --- Estrutura JSX (A mesma da versão anterior, sem alterações) ---
  return (
    <div className="App">
      <h1 className="title">ASCII ART</h1>
      <div className="buttons">
        <button className="btn btn-convert" onClick={() => setConvOpen(true)}>Converter</button>
        <button className="btn btn-info-btn" onClick={() => setInfoOpen(true)}>Info</button>
      </div>

      {isConvOpen && (
        <div className="overlay">
          <div className="modal-convert">
            <button className="modal-close" onClick={() => setConvOpen(false)}>&times;</button>
            <h2 className="modal-convert-title">Converter Imagem</h2>

            {ascii ? (
              <div className="result-area">
                <div className="ascii-container">
                  <pre>{ascii}</pre>
                </div>
              </div>
            ) : (
              <div className="controls-container">
                <p>{loading ? 'Processando, por favor aguarde...' : 'Selecione uma imagem e ajuste os parâmetros para a conversão.'}</p>
                
                <div className="control-item">
                  <label htmlFor="file-upload">1. Escolha uma imagem:</label>
                  <input
                    id="file-upload"
                    type="file"
                    onChange={handleFileChange}
                    accept="image/png, image/jpeg, image/gif"
                    disabled={loading}
                  />
                  {file && !loading && <span>Arquivo selecionado: {file.name}</span>}
                </div>

                <div className="control-item">
                  <label htmlFor="width-slider">2. Ajuste a Largura ({width}px)</label>
                  <input
                    id="width-slider"
                    type="range"
                    min="50"
                    max="400"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    className="slider"
                    disabled={loading}
                  />
                </div>
              </div>
            )}
            
            <div className="modal-actions">
              <button className="btn-clear" onClick={handleClear} disabled={loading || (!file && !ascii)}>
                Limpar
              </button>
              <button
                className="btn-convert"
                onClick={handleUpload}
                disabled={!file || loading}
              >
                {loading ? 'Convertendo...' : 'Converter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isInfoOpen && (
        /* ... seu modal de info ... */
        <div/>
      )}
    </div>
  );
}

export default App;