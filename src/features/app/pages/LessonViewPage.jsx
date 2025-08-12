import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, ButtonGroup, Container, Row, Col } from 'react-bootstrap';

const LessonViewPage = () => {
  const { classeId, matiereId, moduleId, chapitreId, lessonId } = useParams();
  const navigate = useNavigate();

  // Fonctions de navigation
  const handleGestionCours = () => {
    navigate(`/classes/${classeId}/${matiereId}/${moduleId}/${chapitreId}/${lessonId}/cours`);
  };

  const handleGestionQuizzes = () => {
    navigate(`/classes/${classeId}/${matiereId}/${moduleId}/${chapitreId}/${lessonId}/questions`);
  };

  const handleGestionExercices = () => {
    navigate(`/classes/${classeId}/${matiereId}/${moduleId}/${chapitreId}/${lessonId}/exercices`);
  };

  const handleGestionExercicesVideo = () => {
    navigate(`/classes/${classeId}/${matiereId}/${moduleId}/${chapitreId}/${lessonId}/exercices-video`);
  };

  // Navigation breadcrumb
  const handleAllClasses = () => navigate('/classes');
  const handleMatiere = () => navigate(`/classes/${classeId}`);
  const handleModule = () => navigate(`/classes/${classeId}/${matiereId}`);
  const handleChapitre = () => navigate(`/classes/${classeId}/${matiereId}/${moduleId}`);
  const handleLessons = () => navigate(`/classes/${classeId}/${matiereId}/${moduleId}/${chapitreId}`);

  return (
    <Container className="py-4">
      <div className="mb-4">
        <h1>Gestion de la Lesson: {lessonId}</h1>
        
        {/* Breadcrumb de navigation */}
        <div className="d-flex gap-2 align-items-center mb-4">
          <Button variant="link" onClick={handleAllClasses} className="p-0">
            les classes
          </Button>
          <span>/</span>
          <Button variant="link" onClick={handleMatiere} className="p-0">
            les matieres
          </Button>
          <span>/</span>
          <Button variant="link" onClick={handleModule} className="p-0">
            les modules
          </Button>
          <span>/</span>
          <Button variant="link" onClick={handleChapitre} className="p-0">
            les chapitres
          </Button>
          <span>/</span>
          <Button variant="link" onClick={handleLessons} className="p-0">
            les leçons
          </Button>
          <span>/</span>
          <span>{lessonId}</span>
        </div>

        {/* Boutons de gestion */}
        <Row className="mb-4">
          <Col>
            <h3>Gestion du contenu</h3>
            <ButtonGroup vertical className="w-100">
              <Button 
                variant="primary" 
                onClick={handleGestionCours}
                size="lg"
                className="mb-2 text-start"
              >
                Gestion des Cours
              </Button>
              <Button 
                variant="success" 
                onClick={handleGestionQuizzes}
                size="lg"
                className="mb-2 text-start"
              >
                Gestion des Quizzes
              </Button>
              <Button 
                variant="warning" 
                onClick={handleGestionExercices}
                size="lg"
                className="mb-2 text-start"
              >
                Gestion des Exercices
              </Button>
              <Button 
                variant="danger" 
                onClick={handleGestionExercicesVideo}
                size="lg"
                className="text-start"
              >
                Gestion des Exercices Video
              </Button>
            </ButtonGroup>
          </Col>
        </Row>

        {/* Section pour afficher les détails de la lesson */}
        <Row>
          <Col>
            <h3>Détails de la Lesson</h3>
            <div className="border p-3 rounded">
              <p><strong>Classe:</strong> {classeId}</p>
              <p><strong>Matière:</strong> {matiereId}</p>
              <p><strong>Module:</strong> {moduleId}</p>
              <p><strong>Chapitre:</strong> {chapitreId}</p>
              <p><strong>Lesson ID:</strong> {lessonId}</p>
            </div>
          </Col>
        </Row>
      </div>
    </Container>
  );
};

export default LessonViewPage;