import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ContentCard from '../components/ContentCard';
import ItemForm from '../components/ItemForm';
import { Button, Modal, Spinner, Alert, Row, Col, Toast } from 'react-bootstrap';
import ConfirmModal from '../components/ConfirmModal';
import { 
  addLesson, 
  deleteLesson, 
  updateLesson, 
  getAllLessons
} from '../../../utils/crudfirestore';

const LessonsPage = () => {
  const { classeId, matiereId, moduleId, chapitreId } = useParams();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentEditLesson, setCurrentEditLesson] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState(null);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const lessonsData = await getAllLessons(classeId, matiereId, moduleId, chapitreId);
      setLessons(lessonsData);
    } catch (err) {
      console.error('Erreur de récupération:', err);
      setError('Erreur lors de la récupération des lessons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, [classeId, matiereId, moduleId, chapitreId]);

  const handleAddLesson = async (newLesson) => {
    try {
      setProcessing(true);
      
      await addLesson(
        classeId, 
        matiereId, 
        moduleId, 
        chapitreId,
        newLesson.id, 
        newLesson.title, 
        newLesson.index, 
        newLesson.icon
      );

      setToast({
        show: true,
        message: 'Lesson ajoutée avec succès',
        variant: 'success'
      });

      fetchLessons();
      setShowAddModal(false);
    } catch (err) {
      console.error('Erreur lors de l\'ajout:', err);
      setToast({
        show: true,
        message: 'Erreur lors de l\'ajout de la lesson',
        variant: 'danger'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleEditLesson = (lessonToEdit) => {
    setCurrentEditLesson(lessonToEdit);
    setShowAddModal(true);
  };

  const handleUpdateLesson = async (updatedLesson) => {
    try {
      setProcessing(true);
      
      await updateLesson(
        classeId, 
        matiereId, 
        moduleId, 
        chapitreId,
        updatedLesson.id, 
        updatedLesson.title, 
        updatedLesson.index, 
        updatedLesson.icon
      );

      setToast({
        show: true,
        message: 'Lesson modifiée avec succès',
        variant: 'success'
      });

      fetchLessons();
      setShowAddModal(false);
      setCurrentEditLesson(null);
    } catch (err) {
      console.error('Erreur lors de la modification:', err);
      setToast({
        show: true,
        message: 'Erreur lors de la modification de la lesson',
        variant: 'danger'
      });
    } finally {
      setProcessing(false);
    }
  };

  const confirmDelete = (lessonItem) => {
    setLessonToDelete(lessonItem);
    setShowConfirmModal(true);
  };

  const handleDeleteLesson = async () => {
    try {
      setProcessing(true);
      setShowConfirmModal(false);
      
      await deleteLesson(classeId, matiereId, moduleId, chapitreId, lessonToDelete.id);

      setToast({
        show: true,
        message: 'Lesson supprimée avec succès',
        variant: 'success'
      });

      fetchLessons();
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      setToast({
        show: true,
        message: 'Erreur lors de la suppression de la lesson',
        variant: 'danger'
      });
    } finally {
      setProcessing(false);
      setLessonToDelete(null);
    }
  };

  const handleLessonClick = (lessonItem) => {
    navigate(`/classes/${classeId}/${matiereId}/${moduleId}/${chapitreId}/${lessonItem.id}`);
  };

  const handleChapitreClick = () => {
    navigate(`/classes/${classeId}/${matiereId}/${moduleId}`);
  };

  const handleModuleClick = () => {
    navigate(`/classes/${classeId}/${matiereId}`);
  };

  const handleMatiereClick = () => {
    navigate(`/classes/${classeId}`);
  };

  const handleClasseClick = () => {
    navigate(`/classes`);
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Les Lessons du chapitre {chapitreId} de {matiereId} de {classeId}</h2>
          <div className="d-flex gap-2 align-items-center">
            <Button 
              variant="link" 
              onClick={handleClasseClick}
              className="p-0"
            >
              les classes
            </Button>
            <span>/</span>
            <Button 
              variant="link" 
              onClick={handleMatiereClick}
              className="p-0"
            >
              les matières
            </Button>
            <span>/</span>
            <Button 
              variant="link" 
              onClick={handleModuleClick}
              className="p-0"
            >
              les modules
            </Button>
            <span>/</span>
            <Button 
              variant="link" 
              onClick={handleChapitreClick}
              className="p-0"
            >
              les chapitres
            </Button>
          </div>
        </div>
        <Button 
          variant="primary" 
          onClick={() => {
            setCurrentEditLesson(null);
            setShowAddModal(true);
          }}
          disabled={processing}
        >
          Ajouter une lesson
        </Button>
      </div>

      {loading && (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </Spinner>
          <p>Chargement des lessons...</p>
        </div>
      )}

      {error && (
        <Alert variant="danger" className="my-3">
          {error}
          <Button variant="link" onClick={fetchLessons}>
            Réessayer
          </Button>
        </Alert>
      )}

      {!loading && !error && (
        <Row xs={1} md={2} lg={3} xl={4} className="g-4">
          {lessons.map((lessonItem) => (
            <Col key={lessonItem.id}>
              <ContentCard
                item={lessonItem}
                onClick={handleLessonClick}
                onDelete={confirmDelete}
                onEdit={handleEditLesson}
                disabled={processing}
              />
            </Col>
          ))}
        </Row>
      )}

      {/* Modal pour ajouter/modifier une lesson */}
      <Modal show={showAddModal} onHide={() => {
        if (!processing) {
          setShowAddModal(false);
          setCurrentEditLesson(null);
        }
      }}>
        <Modal.Header closeButton>
          <Modal.Title>
            {currentEditLesson ? 'Modifier la lesson' : 'Ajouter une lesson'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ItemForm
            itemType="lesson"
            itemToEdit={currentEditLesson}
            onSubmit={currentEditLesson ? handleUpdateLesson : handleAddLesson}
            onCancel={() => {
              if (!processing) {
                setShowAddModal(false);
                setCurrentEditLesson(null);
              }
            }}
            isProcessing={processing}
          />
        </Modal.Body>
      </Modal>

      {/* Modal de confirmation pour la suppression */}
      <ConfirmModal
        show={showConfirmModal}
        onHide={() => setShowConfirmModal(false)}
        title="Confirmer la suppression"
        message={`Êtes-vous sûr de vouloir supprimer la lesson "${lessonToDelete?.title}" ?`}
        confirmText="Supprimer"
        cancelText="Annuler"
        onConfirm={handleDeleteLesson}
        confirmVariant="danger"
        disabled={processing}
      />

      {/* Toast de notification */}
      <Toast 
        show={toast.show} 
        onClose={() => setToast({...toast, show: false})}
        delay={5000} 
        autohide
        bg={toast.variant}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 9999
        }}
      >
        <Toast.Header closeButton={false}>
          <strong className="me-auto">Notification</strong>
        </Toast.Header>
        <Toast.Body className="text-white">
          {toast.message}
        </Toast.Body>
      </Toast>
    </div>
  );
};

export default LessonsPage;