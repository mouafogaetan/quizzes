import React, { useState, useEffect } from 'react';
import ContentCard from '../components/ContentCard';
import ItemForm from '../components/ItemForm';
import { Button, Modal, Spinner, Alert, Row, Col, Toast } from 'react-bootstrap';
import ConfirmModal from '../components/ConfirmModal';
import { useNavigate } from 'react-router-dom';
import { addClasse, deleteClasse, updateClasse, getAllClasses, checkClassExists } from '../../../utils/crudfirestore';

const ClassesPage = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentEditClass, setCurrentEditClass] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [classToDelete, setClassToDelete] = useState(null);
  const navigate = useNavigate();

  const fetchClasses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const classesData = await getAllClasses();
      setClasses(classesData);
    } catch (err) {
      console.error('Erreur de récupération:', err);
      setError('Erreur lors de la récupération des classes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  

  const handleAddClass = async (newClass) => {
    try {
      setProcessing(true);
      
      const exists = await checkClassExists(newClass.title);
      if (exists) {
        setToast({
          show: true,
          message: 'Une classe avec ce nom existe déjà',
          variant: 'danger'
        });
        return;
      }

      await addClasse(newClass.id, newClass.title);

      setToast({
        show: true,
        message: 'Classe ajoutée avec succès',
        variant: 'success'
      });

      fetchClasses();
      setShowAddModal(false);
    } catch (err) {
      console.error('Erreur lors de l\'ajout:', err);
      setToast({
        show: true,
        message: 'Erreur lors de l\'ajout de la classe',
        variant: 'danger'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleEditClass = (classToEdit) => {
    setCurrentEditClass(classToEdit);
    setShowAddModal(true);
  };

  const handleUpdateClass = async (updatedClass) => {
    try {
      setProcessing(true);
      
      const exists = await checkClassExists(updatedClass.title, updatedClass.id);
      if (exists) {
        setToast({
          show: true,
          message: 'Une classe avec ce nom existe déjà',
          variant: 'danger'
        });
        return;
      }

      await updateClasse(updatedClass.id, updatedClass.title);

      setToast({
        show: true,
        message: 'Classe modifiée avec succès',
        variant: 'success'
      });

      fetchClasses();
      setShowAddModal(false);
      setCurrentEditClass(null);
    } catch (err) {
      console.error('Erreur lors de la modification:', err);
      setToast({
        show: true,
        message: 'Erreur lors de la modification de la classe',
        variant: 'danger'
      });
    } finally {
      setProcessing(false);
    }
  };

  const confirmDelete = (classItem) => {
    setClassToDelete(classItem);
    setShowConfirmModal(true);
  };

  const handleDeleteClass = async () => {
    try {
      setProcessing(true);
      setShowConfirmModal(false);
      
      await deleteClasse(classToDelete.id);

      setToast({
        show: true,
        message: 'Classe supprimée avec succès',
        variant: 'success'
      });

      fetchClasses();
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      setToast({
        show: true,
        message: 'Erreur lors de la suppression de la classe',
        variant: 'danger'
      });
    } finally {
      setProcessing(false);
      setClassToDelete(null);
    }
  };

  const handleClassClick = (classItem) => {
    navigate(`/classes/${classItem.id}`);
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Mes Classes</h2>
        <Button 
          variant="primary" 
          onClick={() => {
            setCurrentEditClass(null);
            setShowAddModal(true);
          }}
          disabled={processing}
        >
          Ajouter une classe
        </Button>
      </div>

      {loading && (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </Spinner>
          <p>Chargement des classes...</p>
        </div>
      )}

      {error && (
        <Alert variant="danger" className="my-3">
          {error}
          <Button variant="link" onClick={fetchClasses}>
            Réessayer
          </Button>
        </Alert>
      )}

      {!loading && !error && (
        <Row xs={1} md={2} lg={3} xl={4} className="g-4">
          {classes.map((classItem) => (
            <Col key={classItem.id}>
              <ContentCard
                item={classItem}
                onClick={handleClassClick}
                onDelete={confirmDelete}
                onEdit={handleEditClass}
                disabled={processing}
              />
            </Col>
          ))}
        </Row>
      )}

      {/* Modal pour ajouter/modifier une classe */}
      <Modal show={showAddModal} onHide={() => {
        if (!processing) {
          setShowAddModal(false);
          setCurrentEditClass(null);
        }
      }}>
        <Modal.Header closeButton>
          <Modal.Title>
            {currentEditClass ? 'Modifier la classe' : 'Ajouter une classe'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ItemForm
            itemType="classe"
            itemToEdit={currentEditClass}
            onSubmit={currentEditClass ? handleUpdateClass : handleAddClass}
            onCancel={() => {
              if (!processing) {
                setShowAddModal(false);
                setCurrentEditClass(null);
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
        message={`Êtes-vous sûr de vouloir supprimer la classe "${classToDelete?.title}" ?`}
        confirmText="Supprimer"
        cancelText="Annuler"
        onConfirm={handleDeleteClass}
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

export default ClassesPage;