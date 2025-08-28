import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ContentCard from '../components/ContentCard';
import ItemForm from '../components/ItemForm';
import { Button, Modal, Spinner, Alert, Row, Col, Toast } from 'react-bootstrap';
import ConfirmModal from '../components/ConfirmModal';
import { addModule, deleteModule, updateModule, getAllModules, getMatiere, getClasse } from '../../../utils/crudfirestore';

const ModulesPage = () => {
  const { classeId, matiereId } = useParams();
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentEditModule, setCurrentEditModule] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState(null);

  const fetchModules = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const modulesData = await getAllModules(classeId, matiereId);
      setModules(modulesData);
    } catch (err) {
      console.error('Erreur de récupération:', err);
      setError('Erreur lors de la récupération des modules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, [classeId, matiereId]);

  const handleAddModule = async (newModule) => {
    try {
      setProcessing(true);
      
      await addModule(classeId, matiereId, newModule.id, newModule.title, newModule.index, newModule.icon);

      setToast({
        show: true,
        message: 'Module ajouté avec succès',
        variant: 'success'
      });

      fetchModules();
      setShowAddModal(false);
    } catch (err) {
      console.error('Erreur lors de l\'ajout:', err);
      setToast({
        show: true,
        message: 'Erreur lors de l\'ajout du module',
        variant: 'danger'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleEditModule = (moduleToEdit) => {
    setCurrentEditModule(moduleToEdit);
    setShowAddModal(true);
  };

  const handleUpdateModule = async (updatedModule) => {
    try {
      setProcessing(true);
      
      await updateModule(
        classeId, 
        matiereId, 
        updatedModule.id, 
        updatedModule.title, 
        updatedModule.index, 
        updatedModule.icon
      );

      setToast({
        show: true,
        message: 'Module modifié avec succès',
        variant: 'success'
      });

      fetchModules();
      setShowAddModal(false);
      setCurrentEditModule(null);
    } catch (err) {
      console.error('Erreur lors de la modification:', err);
      setToast({
        show: true,
        message: 'Erreur lors de la modification du module',
        variant: 'danger'
      });
    } finally {
      setProcessing(false);
    }
  };

  const confirmDelete = (moduleItem) => {
    setModuleToDelete(moduleItem);
    setShowConfirmModal(true);
  };

  const handleDeleteModule = async () => {
    try {
      setProcessing(true);
      setShowConfirmModal(false);
      
      await deleteModule(classeId, matiereId, moduleToDelete.id);

      setToast({
        show: true,
        message: 'Module supprimé avec succès',
        variant: 'success'
      });

      fetchModules();
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      setToast({
        show: true,
        message: 'Erreur lors de la suppression du module',
        variant: 'danger'
      });
    } finally {
      setProcessing(false);
      setModuleToDelete(null);
    }
  };

  const handleModuleClick = (moduleItem) => {
    navigate(`/classes/${classeId}/${matiereId}/${moduleItem.id}`);
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
          <h2>Les Modules de {matiereId} en {classeId}</h2>
          <div className="d-flex gap-2">
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
              les matieres
            </Button>
          </div>
        </div>
        <div className="d-flex gap-2">
          <Button 
            variant="success" 
            onClick={() => navigate(`/classes/${classeId}/${matiereId}/sujets`)}
            disabled={processing}
          >
            Gérer les sujets
          </Button>
          <Button 
            variant="primary" 
            onClick={() => {
              setCurrentEditModule(null);
              setShowAddModal(true);
            }}
            disabled={processing}
          >
            Ajouter un module
          </Button>
        </div>
      </div>

      {loading && (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </Spinner>
          <p>Chargement des modules...</p>
        </div>
      )}

      {error && (
        <Alert variant="danger" className="my-3">
          {error}
          <Button variant="link" onClick={fetchModules}>
            Réessayer
          </Button>
        </Alert>
      )}

      {!loading && !error && (
        <Row xs={1} md={2} lg={3} xl={4} className="g-4">
          {modules.map((moduleItem) => (
            <Col key={moduleItem.id}>
              <ContentCard
                item={moduleItem}
                onClick={handleModuleClick}
                onDelete={confirmDelete}
                onEdit={handleEditModule}
                disabled={processing}
              />
            </Col>
          ))}
        </Row>
      )}

      {/* Modal pour ajouter/modifier un module */}
      <Modal show={showAddModal} onHide={() => {
        if (!processing) {
          setShowAddModal(false);
          setCurrentEditModule(null);
        }
      }}>
        <Modal.Header closeButton>
          <Modal.Title>
            {currentEditModule ? 'Modifier le module' : 'Ajouter un module'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ItemForm
            itemType="module"
            itemToEdit={currentEditModule}
            onSubmit={currentEditModule ? handleUpdateModule : handleAddModule}
            onCancel={() => {
              if (!processing) {
                setShowAddModal(false);
                setCurrentEditModule(null);
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
        message={`Êtes-vous sûr de vouloir supprimer le module "${moduleToDelete?.title}" ?`}
        confirmText="Supprimer"
        cancelText="Annuler"
        onConfirm={handleDeleteModule}
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

export default ModulesPage;