import React, { useState, useEffect, useRef } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { FaYoutube } from 'react-icons/fa';

const ExerciceVideoEditModal = ({ show, onHide, exercice, onSave }) => {
  const [formData, setFormData] = useState({
    titre: '',
    youtubeUrl: '',
    description: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef(null);

  // Initialisation des données
  useEffect(() => {
    if (exercice) {
      setFormData({
        titre: exercice.titre || '',
        youtubeUrl: exercice.youtubeUrl || '',
        description: exercice.description || ''
      });
    } else {
      setFormData({
        titre: '',
        youtubeUrl: '',
        description: ''
      });
    }
    setErrors({});
  }, [exercice]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.titre.trim()) {
      newErrors.titre = 'Le titre est obligatoire';
    }
    
    if (!formData.youtubeUrl.trim()) {
      newErrors.youtubeUrl = 'L\'URL YouTube est obligatoire';
    } else if (!isValidYoutubeUrl(formData.youtubeUrl)) {
      newErrors.youtubeUrl = 'URL YouTube invalide';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidYoutubeUrl = (url) => {
    const pattern = /^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
    return pattern.test(url);
  };

  const extractVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer l'erreur quand l'utilisateur corrige
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const videoId = extractVideoId(formData.youtubeUrl);
      const embedUrl = `https://www.youtube.com/embed/${videoId}`;
      
      await onSave({
        ...formData,
        youtubeEmbedUrl: embedUrl,
        videoId: videoId
      });
      
      onHide();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      setErrors(prev => ({
        ...prev,
        global: 'Une erreur est survenue lors de la sauvegarde'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaYoutube className="text-danger me-2" />
          {exercice?.id ? 'Modifier' : 'Ajouter'} un exercice vidéo
        </Modal.Title>
      </Modal.Header>
      <Form ref={formRef} onSubmit={handleSubmit}>
        <Modal.Body>
          {errors.global && (
            <Alert variant="danger" className="mb-4">
              {errors.global}
            </Alert>
          )}
          
          <Form.Group className="mb-3">
            <Form.Label>Titre de l'exercice *</Form.Label>
            <Form.Control
              type="text"
              name="titre"
              value={formData.titre}
              onChange={handleChange}
              isInvalid={!!errors.titre}
              placeholder="Ex: Introduction aux dérivées"
            />
            <Form.Control.Feedback type="invalid">
              {errors.titre}
            </Form.Control.Feedback>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>URL YouTube *</Form.Label>
            <Form.Control
              type="url"
              name="youtubeUrl"
              value={formData.youtubeUrl}
              onChange={handleChange}
              isInvalid={!!errors.youtubeUrl}
              placeholder="Ex: https://www.youtube.com/watch?v=abc123"
            />
            <Form.Control.Feedback type="invalid">
              {errors.youtubeUrl}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              Collez l'URL complète de la vidéo YouTube
            </Form.Text>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Description (facultative)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Description ou consignes supplémentaires..."
            />
          </Form.Group>
          
          {formData.youtubeUrl && isValidYoutubeUrl(formData.youtubeUrl) && (
            <div className="mt-4">
              <h6>Aperçu de la vidéo :</h6>
              <div className="ratio ratio-16x9 bg-light rounded">
                <iframe
                  src={`https://www.youtube.com/embed/${extractVideoId(formData.youtubeUrl)}`}
                  title="Aperçu"
                  allowFullScreen
                />
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ExerciceVideoEditModal;