import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  getLessonDocUrl, 
  getLessonDocFileId,
  getLessonVideoUrl, 
  updateLessonDocUrl,
  updateLessonDocFileId,
  updateLessonVideoUrl,
  checkTelegramLinkValidity,
  generateTelegramDownloadLink
} from '../../../utils/crudfirestore';
import { Button, Modal, Form, Alert, Spinner, Row, Col } from 'react-bootstrap';
import FileUploader from '../components/FileUploader';

const LessonCoursPage = () => {
  const { classeId, matiereId, moduleId, chapitreId, lessonId } = useParams();
  const [docUrl, setDocUrl] = useState(null);
  const [docFileId, setDocFileId] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDocModal, setShowDocModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [tempVideoUrl, setTempVideoUrl] = useState('');

  // Chargement initial des données
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [docUrl, fileId, video] = await Promise.all([
          getLessonDocUrl(classeId, matiereId, moduleId, chapitreId, lessonId),
          getLessonDocFileId(classeId, matiereId, moduleId, chapitreId, lessonId),
          getLessonVideoUrl(classeId, matiereId, moduleId, chapitreId, lessonId)
        ]);

        setDocFileId(fileId);
        setVideoUrl(video || '');

        // Vérifier et régénérer l'URL si nécessaire
        if (docUrl) {
          const { isValid } = await checkTelegramLinkValidity(docUrl);
          if (!isValid && fileId) {
            const newUrl = await handleRegenerateDocUrl(fileId);
            setDocUrl(newUrl);
          } else {
            setDocUrl(docUrl);
          }
        }
      } catch (err) {
        setError('Erreur lors du chargement des données');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [classeId, matiereId, moduleId, chapitreId, lessonId]);

  // Régénérer l'URL du document
  const handleRegenerateDocUrl = async (fileId) => {
    try {
      const { url } = await generateTelegramDownloadLink(fileId);
      await updateLessonDocUrl(classeId, matiereId, moduleId, chapitreId, lessonId, url);
      return url;
    } catch (err) {
      console.error('Erreur lors de la régénération du lien', err);
      throw err;
    }
  };

  // Gestion de l'upload de document
  const handleDocUploadComplete = async (fileData) => {
    try {
      // fileData doit contenir { fileId, fileUrl }
      await Promise.all([
        updateLessonDocFileId(classeId, matiereId, moduleId, chapitreId, lessonId, fileData.fileId),
        updateLessonDocUrl(classeId, matiereId, moduleId, chapitreId, lessonId, fileData.fileUrl)
      ]);
      
      setDocFileId(fileData.fileId);
      setDocUrl(fileData.fileUrl);
      setShowDocModal(false);
    } catch (err) {
      setError('Erreur lors de la mise à jour du document');
      console.error(err);
    }
  };

  // Gestion de l'URL vidéo
  const handleVideoUrlSubmit = async () => {
    try {
      await updateLessonVideoUrl(classeId, matiereId, moduleId, chapitreId, lessonId, tempVideoUrl);
      setVideoUrl(tempVideoUrl);
      setShowVideoModal(false);
    } catch (err) {
      setError('Erreur lors de la mise à jour de la vidéo');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" />
        <p>Chargement en cours...</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h1>Gestion du Cours</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}

      {/* Section Document */}
      <div className="mb-5 p-4 border rounded">
        <h3>Document du Cours</h3>
        {docUrl ? (
          <>
            <p>Document actuel: <a href={docUrl} target="_blank" rel="noopener noreferrer">Télécharger</a></p>
            <div className="d-flex gap-2">
              <Button variant="primary" onClick={() => setShowDocModal(true)}>
                Modifier le Document
              </Button>
              <Button 
                variant="secondary" 
                onClick={async () => {
                  try {
                    const newUrl = await handleRegenerateDocUrl(docFileId);
                    setDocUrl(newUrl);
                  } catch (err) {
                    setError('Erreur lors de la régénération du lien');
                  }
                }}
                disabled={!docFileId}
              >
                Régénérer le lien
              </Button>
            </div>
          </>
        ) : (
          <>
            <p>Aucun document n'a été ajouté pour ce cours.</p>
            <Button variant="success" onClick={() => setShowDocModal(true)}>
              Ajouter un Document
            </Button>
          </>
        )}
      </div>

      {/* Section Vidéo */}
      <div className="mb-5 p-4 border rounded">
        <h3>Vidéo du Cours</h3>
        {videoUrl ? (
          <>
            <Row>
              <Col md={6}>
                <div className="ratio ratio-16x9 mb-3">
                  <iframe 
                    src={`https://www.youtube.com/embed/${extractYoutubeId(videoUrl)}`} 
                    title="Vidéo du cours" 
                    allowFullScreen
                  />
                </div>
              </Col>
              <Col md={6}>
                <p>URL actuelle: <a href={videoUrl} target="_blank" rel="noopener noreferrer">{videoUrl}</a></p>
                <Button variant="primary" onClick={() => {
                  setTempVideoUrl(videoUrl);
                  setShowVideoModal(true);
                }}>
                  Modifier la Vidéo
                </Button>
              </Col>
            </Row>
          </>
        ) : (
          <>
            <p>Aucune vidéo n'a été ajoutée pour ce cours.</p>
            <Button variant="success" onClick={() => {
              setTempVideoUrl('');
              setShowVideoModal(true);
            }}>
              Ajouter une Vidéo
            </Button>
          </>
        )}
      </div>

      {/* Modal pour le document */}
      <Modal show={showDocModal} onHide={() => setShowDocModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{docUrl ? 'Modifier' : 'Ajouter'} le Document</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FileUploader 
            onUploadComplete={handleDocUploadComplete} 
            allowedTypes={['application/pdf']}
            maxSize={6 * 1024 * 1024} // 6MB
            returnFileId // Important pour obtenir le file_id
          />
        </Modal.Body>
      </Modal>

      {/* Modal pour la vidéo */}
      <Modal show={showVideoModal} onHide={() => setShowVideoModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{videoUrl ? 'Modifier' : 'Ajouter'} la Vidéo YouTube</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>URL YouTube de la vidéo</Form.Label>
            <Form.Control
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={tempVideoUrl}
              onChange={(e) => setTempVideoUrl(e.target.value)}
            />
            <Form.Text className="text-muted">
              Collez l'URL complète de la vidéo YouTube
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowVideoModal(false)}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleVideoUrlSubmit}>
            Enregistrer
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

// Fonction utilitaire pour extraire l'ID d'une URL YouTube
function extractYoutubeId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export default LessonCoursPage;