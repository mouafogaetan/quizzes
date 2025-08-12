import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Badge, Modal } from 'react-bootstrap';
import { FaPlay, FaEdit, FaTrash, FaYoutube } from 'react-icons/fa';

const ExerciceVideo = ({ 
  exercice, 
  onEdit, 
  onDelete,
  enableActions = true
}) => {
  const [showModal, setShowModal] = useState(false);

  // Extraire l'ID vidéo YouTube depuis l'URL
  const getYoutubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYoutubeId(exercice.youtubeUrl);

  return (
    <Card className="mb-4">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <FaYoutube className="text-danger me-2" size={24} />
          <h5 className="mb-0">{exercice.titre}</h5>
        </div>
        
        {enableActions && (
          <div>
            <Button 
              variant="outline-primary" 
              size="sm" 
              className="me-2"
              onClick={() => onEdit(exercice)}
            >
              <FaEdit className="me-1" /> Modifier
            </Button>
            <Button 
              variant="outline-danger" 
              size="sm"
              onClick={() => onDelete(exercice)}
            >
              <FaTrash className="me-1" /> Supprimer
            </Button>
          </div>
        )}
      </Card.Header>
      
      <Card.Body>
        {videoId ? (
          <div className="ratio ratio-16x9 mb-3">
            <iframe 
              src={`https://www.youtube.com/embed/${videoId}`}
              title={exercice.titre}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            />
          </div>
        ) : (
          <div className="text-center py-4 bg-light rounded">
            <p className="text-muted">URL YouTube invalide</p>
          </div>
        )}
        
        <Button 
          variant="primary" 
          onClick={() => setShowModal(true)}
          className="mt-2"
        >
          <FaPlay className="me-1" /> Voir en plein écran
        </Button>
      </Card.Body>

      {/* Modal plein écran */}
      <Modal 
        show={showModal} 
        onHide={() => setShowModal(false)}
        size="lg"
        centered
        fullscreen="md-down"
      >
        <Modal.Header closeButton>
          <Modal.Title>{exercice.titre}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          {videoId && (
            <div className="ratio ratio-16x9">
              <iframe 
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                title={exercice.titre}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              />
            </div>
          )}
        </Modal.Body>
      </Modal>
    </Card>
  );
};

export default ExerciceVideo;