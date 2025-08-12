import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ContentCard from '../components/ContentCard';
import ItemForm from '../components/ItemForm';
import { Button, Modal, Spinner, Alert, Row, Col, Toast } from 'react-bootstrap';
import ConfirmModal from '../components/ConfirmModal';
import { addMatiere, deleteMatiere, updateMatiere, getAllMatieres } from '../../../utils/crudfirestore';

const MatieresPage = () => {
  const { classeId } = useParams();
  const navigate = useNavigate();
  const [matieres, setMatieres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentEditMatiere, setCurrentEditMatiere] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [matiereToDelete, setMatiereToDelete] = useState(null);

  const fetchMatieres = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const matieresData = await getAllMatieres(classeId);
      setMatieres(matieresData);
    } catch (err) {
      console.error('Erreur de récupération:', err);
      setError('Erreur lors de la récupération des matières');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatieres();
  }, [classeId]);

  const handleAddMatiere = async (newMatiere) => {
    try {
      setProcessing(true);
      
      await addMatiere(classeId, newMatiere.id, newMatiere.title, newMatiere.icon);

      setToast({
        show: true,
        message: 'Matière ajoutée avec succès',
        variant: 'success'
      });

      fetchMatieres();
      setShowAddModal(false);
    } catch (err) {
      console.error('Erreur lors de l\'ajout:', err);
      setToast({
        show: true,
        message: 'Erreur lors de l\'ajout de la matière',
        variant: 'danger'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleEditMatiere = (matiereToEdit) => {
    setCurrentEditMatiere(matiereToEdit);
    setShowAddModal(true);
  };

  const handleUpdateMatiere = async (updatedMatiere) => {
    try {
      setProcessing(true);
      
      await updateMatiere(classeId, updatedMatiere.id, updatedMatiere.title, updatedMatiere.icon);

      setToast({
        show: true,
        message: 'Matière modifiée avec succès',
        variant: 'success'
      });

      fetchMatieres();
      setShowAddModal(false);
      setCurrentEditMatiere(null);
    } catch (err) {
      console.error('Erreur lors de la modification:', err);
      setToast({
        show: true,
        message: 'Erreur lors de la modification de la matière',
        variant: 'danger'
      });
    } finally {
      setProcessing(false);
    }
  };

  const confirmDelete = (matiereItem) => {
    setMatiereToDelete(matiereItem);
    setShowConfirmModal(true);
  };

  const handleDeleteMatiere = async () => {
    try {
      setProcessing(true);
      setShowConfirmModal(false);
      
      await deleteMatiere(classeId, matiereToDelete.id);

      setToast({
        show: true,
        message: 'Matière supprimée avec succès',
        variant: 'success'
      });

      fetchMatieres();
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      setToast({
        show: true,
        message: 'Erreur lors de la suppression de la matière',
        variant: 'danger'
      });
    } finally {
      setProcessing(false);
      setMatiereToDelete(null);
    }
  };

  const handleMatiereClick = (matiereItem) => {
    navigate(`/classes/${classeId}/${matiereItem.id}`);
  };

  const handleClasseClick = () => {
    navigate('/classes');
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Les Matières de {classeId}</h2>
          <Button 
            variant="link" 
            onClick={handleClasseClick}
            className="p-0"
          >
            les classes
          </Button>
        </div>
        <Button 
          variant="primary" 
          onClick={() => {
            setCurrentEditMatiere(null);
            setShowAddModal(true);
          }}
          disabled={processing}
        >
          Ajouter une matière
        </Button>
      </div>

      {loading && (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </Spinner>
          <p>Chargement des matières...</p>
        </div>
      )}

      {error && (
        <Alert variant="danger" className="my-3">
          {error}
          <Button variant="link" onClick={fetchMatieres}>
            Réessayer
          </Button>
        </Alert>
      )}

      {!loading && !error && (
        <Row xs={1} md={2} lg={3} xl={4} className="g-4">
          {matieres.map((matiereItem) => (
            <Col key={matiereItem.id}>
              <ContentCard
                item={matiereItem}
                onClick={handleMatiereClick}
                onDelete={confirmDelete}
                onEdit={handleEditMatiere}
                disabled={processing}
              />
            </Col>
          ))}
        </Row>
      )}

      {/* Modal pour ajouter/modifier une matière */}
      <Modal show={showAddModal} onHide={() => {
        if (!processing) {
          setShowAddModal(false);
          setCurrentEditMatiere(null);
        }
      }}>
        <Modal.Header closeButton>
          <Modal.Title>
            {currentEditMatiere ? 'Modifier la matière' : 'Ajouter une matière'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ItemForm
            itemType="matiere"
            itemToEdit={currentEditMatiere}
            onSubmit={currentEditMatiere ? handleUpdateMatiere : handleAddMatiere}
            onCancel={() => {
              if (!processing) {
                setShowAddModal(false);
                setCurrentEditMatiere(null);
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
        message={`Êtes-vous sûr de vouloir supprimer la matière "${matiereToDelete?.title}" ?`}
        confirmText="Supprimer"
        cancelText="Annuler"
        onConfirm={handleDeleteMatiere}
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

export default MatieresPage;