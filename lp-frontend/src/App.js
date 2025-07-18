import React, { useState, useEffect } from 'react';
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
  const [frames, setFrames] = useState([]);
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    if (frames.length === 0) return;
    const interval = setInterval(() => {
      setFrameIndex(i => (i + 1) % frames.length);
    }, 100);
    return () => clearInterval(interval);
  }, [frames]);

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
    setFrames([]);
    setFrameIndex(0);
  };

  const handleUpload = () => {
    if (!file) {
      alert('Por favor, selecione um arquivo primeiro!');
      return;
    }
    setLoading(true);
    setAscii('');
    setFrames([]);
    setFrameIndex(0);

    const formData = new FormData();
    formData.append('image', file);
    formData.append('width', width);

    const isGif = file.type === 'image/gif';
    const url = isGif
      ? 'http://127.0.0.1:8080/api/convert-gif'
      : 'http://127.0.0.1:8080/api/convert-image';

    fetch(url, {
      method: 'POST',
      body: formData,
    })
      .then(async res => {
        if (!res.ok) throw new Error('Falha no servidor');
        if (isGif) {
          const data = await res.json();
          setFrames(data);
        } else {
          const text = await res.text();
          setAscii(text);
        }
      })
      .catch(err => {
        console.error(err);
        alert('Erro ao converter.');
      })
      .finally(() => setLoading(false));
  };

  const handleCopy = () => {
    const displayed = frames.length
      ? frames[frameIndex]
      : ascii;
    navigator.clipboard.writeText(displayed)
      .then(() => alert('ASCII copiado!'))
      .catch(() => alert('Falha ao copiar.'));
  };

  // --- Estrutura JSX ---
  return (
    <div className="App">
      <div className="content-wrap">
        <h1 className="title">Conversor de ASCII ART</h1>
        <div className="container-buttons">
          <button className="btn" onClick={() => setConvOpen(true)}>
            Converter
          </button>
          <button className="btn" onClick={() => setInfoOpen(true)}>
            Informações
          </button>
        </div>
      </div>

      {isConvOpen && (
        <div className="overlay">
          <div className="modal-convert">
            <button className="modal-close" onClick={() => setConvOpen(false)}>
              &times;
            </button>

            <div className="modal-header">
              <h2 className="modal-convert-title">Converter Imagem</h2>
              <h4 className="modal-convert-title">
                - Selecione uma arquivo
              </h4>
            </div>

            {(ascii || frames.length) ? (
              <div className="result-area">
                <div className="ascii-container">
                  <pre>
                    {frames.length
                      ? frames[frameIndex]
                      : ascii
                    }
                  </pre>
                </div>
              </div>
            ) : (
              <div className="controls-container">
                <div className="control-item">
                  <label htmlFor="file-upload">1. Escolha um arquivo:</label>
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/png, image/jpeg, image/gif"
                    onChange={handleFileChange}
                    disabled={loading}
                  />
                  {file && !loading && (
                    <span>{file.name}</span>
                  )}
                </div>
                <div className="control-item">
                  <label htmlFor="width-slider">
                    2. Ajuste a Largura ({width}px)
                  </label>
                  <input
                    id="width-slider"
                    type="range"
                    min="50"
                    max="400"
                    value={width}
                    onChange={e => setWidth(Number(e.target.value))}
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
                disabled={loading || (!ascii && frames.length === 0)}
              >
                Copiar
              </button>
              <button
                className="btn-clear"
                onClick={handleClear}
                disabled={loading || (!file && !ascii && frames.length === 0)}
              >
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
          {projectInfo.description.split('\n\n').map((par, i) => (
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
            <p>Gostou do que viu? Para mais informações, acesse:</p>
            <div className="info-cta-buttons">
              <a
                href={projectInfo.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="cta-button"
              >
                GitHub
              </a>
              <a
                href={projectInfo.linkWiki}
                target="_blank"
                rel="noopener noreferrer"
                className="wiki-button"
              >
                Wiki
              </a>
            </div>
          </div>
        </div>
      </Modal>

      {/* Footer da página */}
      <Footer />
    </div>
  );
}

export default App;