import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  getLessonDocUrl, 
  updateLessonDocUrl,
  getLessonVideoUrls, 
  updateLessonVideoUrls
} from '../../../utils/crudfirestore';
import { Button, Modal, Form, Alert, Spinner, Row, Col, ListGroup, Badge } from 'react-bootstrap';

const LessonCoursPage = () => {
  const { classeId, matiereId, moduleId, chapitreId, lessonId } = useParams();
  const [docUrl, setDocUrl] = useState(null);
  const [videoUrls, setVideoUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDocModal, setShowDocModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [tempDocUrl, setTempDocUrl] = useState('');
  const [tempVideoUrl, setTempVideoUrl] = useState('');
  const [editingVideoIndex, setEditingVideoIndex] = useState(null);

  // Chargement initial des données
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [docUrl, videos] = await Promise.all([
          getLessonDocUrl(classeId, matiereId, moduleId, chapitreId, lessonId),
          getLessonVideoUrls(classeId, matiereId, moduleId, chapitreId, lessonId)
        ]);

        setDocUrl(docUrl || '');
        setVideoUrls(videos || []);
      } catch (err) {
        setError('Erreur lors du chargement des données');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [classeId, matiereId, moduleId, chapitreId, lessonId]);

  // Gestion de l'URL du document
  const handleDocUrlSubmit = async () => {
    try {
      await updateLessonDocUrl(classeId, matiereId, moduleId, chapitreId, lessonId, tempDocUrl);
      setDocUrl(tempDocUrl);
      setShowDocModal(false);
      setTempDocUrl('');
    } catch (err) {
      setError('Erreur lors de la mise à jour du document');
      console.error(err);
    }
  };

  // Gestion des URLs vidéo
  const handleAddVideoUrl = async () => {
    try {
      const newVideoUrls = [...videoUrls];
      if (editingVideoIndex !== null) {
        newVideoUrls[editingVideoIndex] = tempVideoUrl;
      } else {
        newVideoUrls.push(tempVideoUrl);
      }
      
      await updateLessonVideoUrls(classeId, matiereId, moduleId, chapitreId, lessonId, newVideoUrls);
      setVideoUrls(newVideoUrls);
      setShowVideoModal(false);
      setTempVideoUrl('');
      setEditingVideoIndex(null);
    } catch (err) {
      setError('Erreur lors de la mise à jour de la vidéo');
      console.error(err);
    }
  };

  const handleDeleteVideoUrl = async (index) => {
    try {
      const newVideoUrls = videoUrls.filter((_, i) => i !== index);
      await updateLessonVideoUrls(classeId, matiereId, moduleId, chapitreId, lessonId, newVideoUrls);
      setVideoUrls(newVideoUrls);
    } catch (err) {
      setError('Erreur lors de la suppression de la vidéo');
      console.error(err);
    }
  };

  const handleEditVideoUrl = (index) => {
    setTempVideoUrl(videoUrls[index]);
    setEditingVideoIndex(index);
    setShowVideoModal(true);
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
      
      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

      {/* Section Document */}
      <div className="mb-5 p-4 border rounded">
        <h3>Document du Cours</h3>
        {docUrl ? (
          <>
            <Row>
              <Col md={6}>
                <h5>Prévisualisation du document</h5>
                <div className="border rounded p-2" style={{ height: '400px', overflow: 'auto' }}>
                  <iframe 
                    src={docUrl} 
                    title="Document du cours"
                    width="100%" 
                    height="100%"
                    frameBorder="0"
                    style={{ minHeight: '380px' }}
                  />
                </div>
              </Col>
              <Col md={6}>
                <p>URL actuelle: <a href={docUrl} target="_blank" rel="noopener noreferrer">{docUrl}</a></p>
                <Button 
                  variant="primary" 
                  onClick={() => {
                    setTempDocUrl(docUrl);
                    setShowDocModal(true);
                  }}
                >
                  Modifier l'URL du Document
                </Button>
              </Col>
            </Row>
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

      {/* Section Vidéos */}
      <div className="mb-5 p-4 border rounded">
        <h3>Vidéos du Cours</h3>
        {videoUrls.length > 0 ? (
          <>
            <Row>
              <Col md={6}>
                <h5>Liste des vidéos</h5>
                <ListGroup>
                  {videoUrls.map((url, index) => (
                    <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                      <div>
                        <Badge bg="secondary" className="me-2">{index + 1}</Badge>
                        <a href={url} target="_blank" rel="noopener noreferrer">
                          {extractYoutubeId(url) || url}
                        </a>
                      </div>
                      <div>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                          onClick={() => handleEditVideoUrl(index)}
                        >
                          Modifier
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteVideoUrl(index)}
                        >
                          Supprimer
                        </Button>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Col>
              <Col md={6}>
                <h5>Prévisualisation de la première vidéo</h5>
                {videoUrls.length > 0 && (
                  <div className="ratio ratio-16x9 mb-3">
                    <iframe 
                      src={`https://www.youtube.com/embed/${extractYoutubeId(videoUrls[0])}`} 
                      title="Vidéo du cours" 
                      allowFullScreen
                    />
                  </div>
                )}
              </Col>
            </Row>
            <div className="mt-3">
              <Button variant="success" onClick={() => {
                setTempVideoUrl('');
                setEditingVideoIndex(null);
                setShowVideoModal(true);
              }}>
                Ajouter une autre Vidéo
              </Button>
            </div>
          </>
        ) : (
          <>
            <p>Aucune vidéo n'a été ajoutée pour ce cours.</p>
            <Button variant="success" onClick={() => {
              setTempVideoUrl('');
              setEditingVideoIndex(null);
              setShowVideoModal(true);
            }}>
              Ajouter une Vidéo
            </Button>
          </>
        )}
      </div>

      {/* Modal pour le document */}
      <Modal show={showDocModal} onHide={() => setShowDocModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{docUrl ? 'Modifier' : 'Ajouter'} l'URL du Document</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>URL du document (page HTML)</Form.Label>
            <Form.Control
              type="url"
              placeholder="https://example.com/document.html"
              value={tempDocUrl}
              onChange={(e) => setTempDocUrl(e.target.value)}
            />
            <Form.Text className="text-muted">
              Collez l'URL complète de la page HTML du document
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDocModal(false)}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleDocUrlSubmit}>
            Enregistrer
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal pour la vidéo */}
      <Modal show={showVideoModal} onHide={() => setShowVideoModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingVideoIndex !== null ? 'Modifier' : 'Ajouter'} une Vidéo YouTube
          </Modal.Title>
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
          <Button variant="primary" onClick={handleAddVideoUrl}>
            {editingVideoIndex !== null ? 'Modifier' : 'Ajouter'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

// Fonction utilitaire pour extraire l'ID d'une URL YouTube
function extractYoutubeId(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export default LessonCoursPage;