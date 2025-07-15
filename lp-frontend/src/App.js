import React, { useState } from 'react';
import Modal from 'react-modal';
import { useDropzone } from 'react-dropzone';
import { projectInfo } from './data/projectInfo';
import './App.css';

Modal.setAppElement('#root');

function App() {
  const [file, setFile] = useState(null);
  const [ascii, setAscii] = useState('');
  const [loading, setLoading] = useState(false);
  const [isConvOpen, setConvOpen] = useState(false);
  const [isInfoOpen, setInfoOpen] = useState(false);

  const handleDrop = (accepted) => {
    setFile(accepted[0]);
    setAscii('');
  };

  const {
    getRootProps,
    getInputProps
  } = useDropzone({
    onDrop: handleDrop,
    accept: 'image/*'
  });

  const handleConvert = () => {
    if (!file) return alert('Selecione um arquivo!');
    setLoading(true);
    const fd = new FormData();
    fd.append('image', file);
    fetch('http://127.0.0.1:8080/api/convert', { method: 'POST', body: fd })
      .then(res => res.text())
      .then(txt => setAscii(txt))
      .catch(() => alert('Erro no servidor'))
      .finally(() => {
        setLoading(false);
        setAscii('');
        setFile(null);
      });
  };

  return (
    <div className="App">
      <h1 className="title">Meu Conversor de Arte ASCII</h1>

      <div className="buttons">
        <button
          className="btn btn-convert"
          onClick={() => setConvOpen(true)}
        >
          Converter
        </button>
        <button
          className="btn btn-info-btn"
          onClick={() => setInfoOpen(true)}
        >
          Info
        </button>
      </div>

      {/* Modal de Conversão */}
      <Modal
        isOpen={isConvOpen}
        onRequestClose={() => setConvOpen(false)}
        className="modal modal-convert"
        overlayClassName="overlay"
      >
        {/* Botão fechar */}
        <button className="modal-close" onClick={() => setConvOpen(false)}>
          &times;
        </button>

        <h2 className="modal-convert-title">Arraste sua imagem ou GIF aqui</h2>

        <div {...getRootProps()} className="dropzone">
          <input {...getInputProps()} />
          {file ? file.name : 'Arraste ou clique para selecionar'}
        </div>

        <div className="modal-actions">

          {/* Botão de ação Limpar */}
          <button
            className="btn-clear"
            onClick={() => {
              setFile(null);
              setAscii('');
            }}
            disabled={!file}
          >
            Limpar
            <i className="material-icons" style={{ marginRight: '0.3rem' }}>
              delete
            </i>
          </button>

          {/* Botão de ação Converter */}
          <button
            className="btn-convert"
            onClick={handleConvert}
            disabled={loading || !file}
          >
            {loading ? 'Convertendo...' : 'Converter'}
            <i className="material-icons" style={{ marginRight: '0.3rem' }}>
              send
            </i>
          </button>
        </div>

        {/* Resultado ASCII */}
        {ascii && <pre className="ascii-output">{ascii}</pre>}
      </Modal>

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
        </div>
      </Modal>
    </div>
  );
}

export default App;
