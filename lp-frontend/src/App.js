// lp-frontend/src/App.js

import React, { useState } from 'react';
import './App.css'; 

// Componente do Rodapé
const Footer = () => {
  const participants = [
    { name: 'Lucas Tavares', matricula: '231011650' },
    { name: 'Guilherme Avila', matricula: '211068305' },
    { name: 'Henrique Valente', matricula: '211055380' },
    { name: 'Heitor Fernandes', matricula: '231011453' },
    { name: 'Gabriel Xisto', matricula: '211055503' },
  ];

  return (
    <footer className="footer">
      <div className="participants">
        {participants.map(p => (
          <div key={p.matricula} className="participant">
            <span className="name">{p.name}</span>
            <span className="matricula">{p.matricula}</span>
          </div>
        ))}
      </div>
      <div className="repo-link">
        <a href="https://github.com/guiavicar/LP" target="_blank" rel="noopener noreferrer">
          Repositório do Projeto
        </a>
      </div>
    </footer>
  );
};

function App() {
  // --- Estados da UI (vindos do seu novo design) ---
  const [isConvOpen, setConvOpen] = useState(false);
  const [isInfoOpen, setInfoOpen] = useState(false);

  // --- Estados da Funcionalidade (que estamos adicionando) ---
  const [file, setFile] = useState(null);
  const [ascii, setAscii] = useState('');
  const [loading, setLoading] = useState(false);
  const [width, setWidth] = useState(200);

  // --- Funções de Lógica ---
  const handleFileChange = (event) => {
    const selected = event.target.files[0];
    if (selected) {
      setFile(selected);
      setAscii(''); // Limpa a arte anterior ao escolher novo arquivo
    }
  };

  const handleUpload = () => {
    if (!file) {
      alert('Por favor, selecione um arquivo primeiro!');
      return;
    }
    setLoading(true);
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
      return response.text();
    })
    .then(data => {
      setAscii(data);
    })
    .catch(error => {
      console.error('Erro no upload:', error);
      alert('Ocorreu um erro ao enviar a imagem. Verifique se o backend está rodando.');
    })
    .finally(() => {
      setLoading(false);
    });
  };

  // Função para limpar a seleção e o resultado
  const handleClear = () => {
    setFile(null);
    setAscii('');
  };

  // --- Estrutura JSX (A Interface Visual) ---
  return (
    <div className="App">
      <div className="content-wrap">
        <h1 className="title">ASCII ART</h1>
        <div className="buttons">
          <button className="btn btn-convert" onClick={() => setConvOpen(true)}>Converter</button>
          <button className="btn btn-info-btn" onClick={() => setInfoOpen(true)}>Info</button>
        </div>
      </div>

      {/* ============== MODAL DE CONVERSÃO ============== */}
      {isConvOpen && (
        <div className="overlay">
          <div className="modal-convert">
            <button className="modal-close" onClick={() => setConvOpen(false)}>&times;</button>
            <h2 className="modal-convert-title">Converter Imagem</h2>

            {/* --- SEÇÃO DE RESULTADO --- */}
            {ascii ? (
              // Se JÁ TEMOS a arte, mostra o resultado
              <div className="result-area">
                <div className="ascii-container">
                  <pre>{ascii}</pre>
                </div>
              </div>
            ) : (
              // Se NÃO TEMOS a arte, mostra os controles de upload
              <div className="controls-container">
                <p>Selecione uma imagem e ajuste os parâmetros para a conversão.</p>
                
                <div className="control-item">
                  <label htmlFor="file-upload">1. Escolha uma imagem:</label>
                  <input
                    id="file-upload"
                    type="file"
                    onChange={handleFileChange}
                    accept="image/png, image/jpeg, image/gif"
                  />
                  {file && <span>Arquivo selecionado: {file.name}</span>}
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
                  />
                </div>
              </div>
            )}
            
            {/* --- BOTÕES DE AÇÃO DO MODAL --- */}
            <div className="modal-actions">
              <button className="btn-clear" onClick={handleClear} disabled={!file && !ascii}>
                Limpar
              </button>
              <button
                className="btn-convert" // Reutilizando a classe de estilo
                onClick={handleUpload}
                disabled={!file || loading}
              >
                {loading ? 'Convertendo...' : 'Converter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============== MODAL DE INFORMAÇÃO ============== */}
      {isInfoOpen && (
        <div className="overlay">
          <div className="modal info">
            <button className="modal-close" onClick={() => setInfoOpen(false)}>&times;</button>
            <h2 className="modal-info-title">Sobre o Projeto</h2>
            <div className="info-content">
              {/* Conteúdo da informação */}
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}

export default App;