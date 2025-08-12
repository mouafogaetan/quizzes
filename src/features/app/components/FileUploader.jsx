import React, { useState, useCallback } from 'react';
import { Button, ProgressBar, Form, Alert, Image } from 'react-bootstrap';
import axios from 'axios';
import { generateTelegramDownloadLink } from '../../../utils/crudfirestore';

const FileUploader = ({ onUploadComplete }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);

  // Récupération depuis les variables d'environnement
  const botToken = process.env.REACT_APP_TELEGRAM_BOT_TOKEN;
  const chatId = process.env.REACT_APP_TELEGRAM_CHAT_ID;

  const MAX_FILE_SIZE = 6 * 1024 * 1024; // 6MB

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setError(null);

    // Vérification du type de fichier
    if (file && file.type !== 'application/pdf') {
      setError('Seuls les fichiers PDF sont autorisés');
      return;
    }

    // Vérification de la taille
    if (file && file.size > MAX_FILE_SIZE) {
      setError(`La taille du fichier ne doit pas dépasser ${MAX_FILE_SIZE / 1024 / 1024}MB`);
      return;
    }

    setSelectedFile(file);

    // Génération de la prévisualisation pour les images (couverture PDF)
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const uploadFileToTelegram = useCallback(async () => {
    if (!selectedFile) {
      setError('Veuillez sélectionner un fichier');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    const formData = new FormData();
    formData.append('document', selectedFile);

    try {
      const response = await axios.post(
        `https://api.telegram.org/bot${botToken}/sendDocument?chat_id=${chatId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
        }
      );

      if (response.data.ok) {
        const fileId = response.data.result.document.file_id;
        const result = await generateTelegramDownloadLink(fileId);
        onUploadComplete({fileId, fileUrl:result.url}); // Retourne le file_id persistant
      } else {
        throw new Error(response.data.description || 'Erreur lors de l\'upload');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Erreur lors de l\'envoi du fichier');
    } finally {
      setIsUploading(false);
    }
  }, [selectedFile, botToken, chatId, onUploadComplete]);

  return (
    <div className="p-3 border rounded">
      <h5>Téléverser un document PDF</h5>
      
      <Form.Group controlId="formFile" className="mb-3">
        <Form.Label>Sélectionnez un fichier PDF (max 6MB)</Form.Label>
        <Form.Control 
          type="file" 
          onChange={handleFileChange} 
          disabled={isUploading}
          accept="application/pdf"
        />
      </Form.Group>

      {preview && (
        <div className="mb-3 text-center">
          <Image 
            src={preview} 
            thumbnail 
            style={{ maxWidth: '200px', maxHeight: '200px' }} 
            alt="Aperçu du document" 
          />
        </div>
      )}

      {selectedFile && (
        <div className="mb-3">
          <p>
            Document sélectionné: <strong>{selectedFile.name}</strong> (
            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        </div>
      )}

      {isUploading && (
        <div className="mb-3">
          <ProgressBar 
            now={uploadProgress} 
            label={`${uploadProgress}%`} 
            animated 
          />
          <p className="text-center mt-2">Envoi en cours...</p>
        </div>
      )}

      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}

      <Button
        variant="primary"
        onClick={uploadFileToTelegram}
        disabled={isUploading || !selectedFile}
        className="w-100"
      >
        {isUploading ? 'Envoi en cours...' : 'Téléverser le document'}
      </Button>
    </div>
  );
};

export default FileUploader;