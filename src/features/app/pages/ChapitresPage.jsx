import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ContentCard from '../components/ContentCard';
import ItemForm from '../components/ItemForm';
import { Button, Modal, Spinner, Alert, Row, Col, Toast } from 'react-bootstrap';
import ConfirmModal from '../components/ConfirmModal';
import { 
  addChapitre, 
  deleteChapitre, 
  updateChapitre, 
  getAllChapitres
} from '../../../utils/crudfirestore';

const ChapitresPage = () => {
  const { classeId, matiereId, moduleId } = useParams();
  const navigate = useNavigate();
  const [chapitres, setChapitres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentEditChapitre, setCurrentEditChapitre] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [chapitreToDelete, setChapitreToDelete] = useState(null);

  const fetchChapitres = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const chapitresData = await getAllChapitres(classeId, matiereId, moduleId);
      setChapitres(chapitresData);
    } catch (err) {
      console.error('Erreur de récupération:', err);
      setError('Erreur lors de la récupération des chapitres');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchChapitres();
  }, [classeId, matiereId, moduleId]);

  const handleAddChapitre = async (newChapitre) => {
    try {
      setProcessing(true);
      
      await addChapitre(
        classeId, 
        matiereId, 
        moduleId, 
        newChapitre.id, 
        newChapitre.title, 
        newChapitre.index, 
        newChapitre.icon
      );

      setToast({
        show: true,
        message: 'Chapitre ajouté avec succès',
        variant: 'success'
      });

      fetchChapitres();
      setShowAddModal(false);
    } catch (err) {
      console.error('Erreur lors de l\'ajout:', err);
      setToast({
        show: true,
        message: 'Erreur lors de l\'ajout du chapitre',
        variant: 'danger'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleEditChapitre = (chapitreToEdit) => {
    setCurrentEditChapitre(chapitreToEdit);
    setShowAddModal(true);
  };

  const handleUpdateChapitre = async (updatedChapitre) => {
    try {
      setProcessing(true);
      
      await updateChapitre(
        classeId, 
        matiereId, 
        moduleId, 
        updatedChapitre.id, 
        updatedChapitre.title, 
        updatedChapitre.index, 
        updatedChapitre.icon
      );

      setToast({
        show: true,
        message: 'Chapitre modifié avec succès',
        variant: 'success'
      });

      fetchChapitres();
      setShowAddModal(false);
      setCurrentEditChapitre(null);
    } catch (err) {
      console.error('Erreur lors de la modification:', err);
      setToast({
        show: true,
        message: 'Erreur lors de la modification du chapitre',
        variant: 'danger'
      });
    } finally {
      setProcessing(false);
    }
  };

  const confirmDelete = (chapitreItem) => {
    setChapitreToDelete(chapitreItem);
    setShowConfirmModal(true);
  };

  const handleDeleteChapitre = async () => {
    try {
      setProcessing(true);
      setShowConfirmModal(false);
      
      await deleteChapitre(classeId, matiereId, moduleId, chapitreToDelete.id);

      setToast({
        show: true,
        message: 'Chapitre supprimé avec succès',
        variant: 'success'
      });

      fetchChapitres();
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      setToast({
        show: true,
        message: 'Erreur lors de la suppression du chapitre',
        variant: 'danger'
      });
    } finally {
      setProcessing(false);
      setChapitreToDelete(null);
    }
  };

  const handleChapitreClick = (chapitreItem) => {
    navigate(`/classes/${classeId}/${matiereId}/${moduleId}/${chapitreItem.id}`);
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
          <h2>Les Chapitres du {moduleId} en {matiereId} de la {classeId}</h2>
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
          </div>
        </div>
        <Button 
          variant="primary" 
          onClick={() => {
            setCurrentEditChapitre(null);
            setShowAddModal(true);
          }}
          disabled={processing}
        >
          Ajouter un chapitre
        </Button>
      </div>

      {loading && (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </Spinner>
          <p>Chargement des chapitres...</p>
        </div>
      )}

      {error && (
        <Alert variant="danger" className="my-3">
          {error}
          <Button variant="link" onClick={fetchChapitres}>
            Réessayer
          </Button>
        </Alert>
      )}

      {!loading && !error && (
        <Row xs={1} md={2} lg={3} xl={4} className="g-4">
          {chapitres.map((chapitreItem) => (
            <Col key={chapitreItem.id}>
              <ContentCard
                item={chapitreItem}
                onClick={handleChapitreClick}
                onDelete={confirmDelete}
                onEdit={handleEditChapitre}
                disabled={processing}
              />
            </Col>
          ))}
        </Row>
      )}

      {/* Modal pour ajouter/modifier un chapitre */}
      <Modal show={showAddModal} onHide={() => {
        if (!processing) {
          setShowAddModal(false);
          setCurrentEditChapitre(null);
        }
      }}>
        <Modal.Header closeButton>
          <Modal.Title>
            {currentEditChapitre ? 'Modifier le chapitre' : 'Ajouter un chapitre'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ItemForm
            itemType="chapitre"
            itemToEdit={currentEditChapitre}
            onSubmit={currentEditChapitre ? handleUpdateChapitre : handleAddChapitre}
            onCancel={() => {
              if (!processing) {
                setShowAddModal(false);
                setCurrentEditChapitre(null);
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
        message={`Êtes-vous sûr de vouloir supprimer le chapitre "${chapitreToDelete?.title}" ?`}
        confirmText="Supprimer"
        cancelText="Annuler"
        onConfirm={handleDeleteChapitre}
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

export default ChapitresPage;