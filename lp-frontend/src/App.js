import React, { useState } from 'react';
import Modal from 'react-modal';
import { participants } from './data/participants';
import { projectInfo } from './data/projectInfo';
import './App.css';

const Footer = () => {
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
        <a href={projectInfo.repoUrl} target="_blank" rel="noopener noreferrer">
          Repositório do Projeto
        </a>
      </div>
    </footer>
  );
};

function App() {
  const [isConvOpen, setConvOpen] = useState(false);
  const [isInfoOpen, setInfoOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [ascii, setAscii] = useState('');
  const [loading, setLoading] = useState(false);
  const [width, setWidth] = useState(200);

  // --- Lidar com a seleção do arquivo ---
  const handleFileChange = (event) => {
    const selected = event.target.files[0];
    if (selected) {
      setFile(selected);
      setAscii('');
    }
  };

  // --- Limpar a seleção ---
  const handleClear = () => {
    setFile(null);
    setAscii('');
  };

  const handleUpload = () => {
    if (!file) {
      alert('Por favor, selecione um arquivo primeiro!');
      return;
    }
    setLoading(true);
    setAscii('');

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

        const contentType = response.headers.get("content-type");

        // CASO 1: A RESPOSTA É UM STREAM DE EVENTOS (É UM GIF!)
        if (contentType && contentType.includes("text/event-stream")) {
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          // Função recursiva para ler o stream continuamente
          const readStream = () => {
            reader.read().then(({ done, value }) => {
              if (done) {
                setLoading(false);
                return;
              }

              buffer += decoder.decode(value, { stream: true });

              while (buffer.includes('\n\n')) {
                const messageEnd = buffer.indexOf('\n\n');
                const message = buffer.substring(0, messageEnd);
                buffer = buffer.substring(messageEnd + 2);

                if (message.startsWith('data:')) {
                  const data = message.substring(5).trim();
                  try {
                    const parsedData = JSON.parse(data);
                    setAscii(parsedData);
                  } catch (e) {
                    console.error("Erro ao fazer parse do frame JSON:", e);
                  }
                } else if (message.startsWith('event: end')) {
                  setLoading(false);
                }
              }

              readStream();
            });
          };

          readStream();

        } else {
          // CASO 2: A RESPOSTA É TEXTO SIMPLES (É UMA IMAGEM ESTÁTICA)
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

  const handleCopy = () => {
    navigator.clipboard.writeText(ascii)
      .then(() => alert('ASCII copiado para a área de transferência!'))
      .catch(() => alert('Não foi possível copiar.'));
  };

  // --- Estrutura JSX ---
  return (
    <div className="App">
      <div className="content-wrap">

        <div className="container-title">
          <h1 className="title">Conversor de ASCII ART</h1>
        </div>

        <div className="buttons">
          <button className="btn" onClick={() => setConvOpen(true)}>Converter</button>
          <button className="btn" onClick={() => setInfoOpen(true)}>Informações</button>
        </div>
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
              <button
                className="btn-copy"
                onClick={handleCopy}
                disabled={!ascii}
              >
                <i className="material-icons" style={{ marginRight: '0.3rem' }}>
                  content_copy
                </i>
                Copiar
              </button>

              <button className="btn-clear" onClick={handleClear} disabled={loading || (!file && !ascii)}>
                Limpar
                <i className="material-icons" style={{ marginRight: '0.3rem' }}>
                  delete
                </i>
              </button>
              <button
                className="btn-convert"
                onClick={handleUpload}
                disabled={!file || loading}
              >
                {loading ? 'Convertendo...' : 'Converter'}
                <i className="material-icons" style={{ marginRight: '0.3rem' }}>
                  send
                </i>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Informações do Projeto */}
      <Modal
        isOpen={isInfoOpen}
        onRequestClose={() => setInfoOpen(false)}
        className="modal info"
        overlayClassName="overlay"
      >
        <h2 className="modal-info-title">Sobre o Projeto</h2>
        <div className="info-content">
          {projectInfo.description.trim().split('\n\n').map((par, i) => (
            <p key={i}>{par}</p>
          ))}

          {/* video Informativo */}
          <iframe
            title="Vídeo do Projeto"
            width="100%"
            height="240"
            src={projectInfo.videoUrl}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="info-video"
          />

          {/* CTA Repositório */}
          <div className="info-cta">
            <p>Gostou do que viu? Para mais informações, acesse nosso projeto:</p>
            <a
              href={projectInfo.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="cta-button"
            >
              GitHub
            </a>
          </div>
        </div>
      </Modal>

      {/* Footer da página */}
      <Footer />
    </div>
  );
}

export default App;