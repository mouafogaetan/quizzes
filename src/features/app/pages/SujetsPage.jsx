import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Modal, Spinner, Alert, Row, Col, Toast, Form } from 'react-bootstrap';
import ConfirmModal from '../components/ConfirmModal';
import { 
  getSujetsByMatiere, 
  addSujet, 
  updateSujet, 
  deleteSujet,
  getMatiere,
  getClasse 
} from '../../../utils/crudfirestore';

const SEQUENCES = ['1', '2', '3', '4', '5', '6', 'Exam'];

const SujetsPage = () => {
  const { classeId, matiereId } = useParams();
  const navigate = useNavigate();
  const [sujets, setSujets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentEditSujet, setCurrentEditSujet] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [sujetToDelete, setSujetToDelete] = useState(null);
  const [matiere, setMatiere] = useState(null);
  const [classe, setClasse] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [sujetsData, matiereData, classeData] = await Promise.all([
        getSujetsByMatiere(classeId, matiereId),
        getMatiere(classeId, matiereId),
        getClasse(classeId)
      ]);
      
      setSujets(sujetsData);
      setMatiere(matiereData);
      setClasse(classeData);
    } catch (err) {
      console.error('Erreur de récupération:', err);
      setError('Erreur lors de la récupération des données');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [classeId, matiereId]);

  const handleAddSujet = async (newSujet) => {
    try {
      setProcessing(true);
      
      await addSujet(
        classeId, 
        matiereId, 
        newSujet.id, 
        newSujet.anneeScolaire,
        newSujet.etablissement,
        newSujet.examinateur,
        newSujet.url_doc,
        newSujet.sequence
      );

      setToast({
        show: true,
        message: 'Sujet ajouté avec succès',
        variant: 'success'
      });

      fetchData();
      setShowAddModal(false);
    } catch (err) {
      console.error('Erreur lors de l\'ajout:', err);
      setToast({
        show: true,
        message: 'Erreur lors de l\'ajout du sujet',
        variant: 'danger'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleEditSujet = (sujetToEdit) => {
    setCurrentEditSujet(sujetToEdit);
    setShowAddModal(true);
  };

  const handleUpdateSujet = async (updatedSujet) => {
    try {
      setProcessing(true);
      
      await updateSujet(
        classeId, 
        matiereId, 
        updatedSujet.id, 
        updatedSujet.anneeScolaire,
        updatedSujet.etablissement,
        updatedSujet.examinateur,
        updatedSujet.url_doc,
        updatedSujet.sequence
      );

      setToast({
        show: true,
        message: 'Sujet modifié avec succès',
        variant: 'success'
      });

      fetchData();
      setShowAddModal(false);
      setCurrentEditSujet(null);
    } catch (err) {
      console.error('Erreur lors de la modification:', err);
      setToast({
        show: true,
        message: 'Erreur lors de la modification du sujet',
        variant: 'danger'
      });
    } finally {
      setProcessing(false);
    }
  };

  const confirmDelete = (sujetItem) => {
    setSujetToDelete(sujetItem);
    setShowConfirmModal(true);
  };

  const handleDeleteSujet = async () => {
    try {
      setProcessing(true);
      setShowConfirmModal(false);
      
      await deleteSujet(classeId, matiereId, sujetToDelete.id);

      setToast({
        show: true,
        message: 'Sujet supprimé avec succès',
        variant: 'success'
      });

      fetchData();
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      setToast({
        show: true,
        message: 'Erreur lors de la suppression du sujet',
        variant: 'danger'
      });
    } finally {
      setProcessing(false);
      setSujetToDelete(null);
    }
  };

  const handleModulesClick = () => {
    navigate(`/classes/${classeId}/${matiereId}`);
  };

  const handleMatiereClick = () => {
    navigate(`/classes/${classeId}`);
  };

  const handleClasseClick = () => {
    navigate(`/classes`);
  };

  const previewSujet = (url) => {
    window.open(url, '_blank');
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Sujets d'examen - {matiere?.nom} ({classe?.nom})</h2>
          <div className="d-flex gap-2">
            <Button 
              variant="link" 
              onClick={handleClasseClick}
              className="p-0"
            >
              Classes
            </Button>
            <span>/</span>
            <Button 
              variant="link" 
              onClick={handleMatiereClick}
              className="p-0"
            >
              Matières
            </Button>
            <span>/</span>
            <Button 
              variant="link" 
              onClick={handleModulesClick}
              className="p-0"
            >
              Modules
            </Button>
            <span>/</span>
            <span>Sujets</span>
          </div>
        </div>
        <Button 
          variant="primary" 
          onClick={() => {
            setCurrentEditSujet(null);
            setShowAddModal(true);
          }}
          disabled={processing}
        >
          Ajouter un sujet
        </Button>
      </div>

      {loading && (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </Spinner>
          <p>Chargement des sujets...</p>
        </div>
      )}

      {error && (
        <Alert variant="danger" className="my-3">
          {error}
          <Button variant="link" onClick={fetchData}>
            Réessayer
          </Button>
        </Alert>
      )}

      {!loading && !error && (
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Séquence</th>
                <th>Année scolaire</th>
                <th>Établissement</th>
                <th>Examinateur</th>
                <th>Document</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sujets.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    <p>Aucun sujet disponible</p>
                    <Button variant="primary" onClick={() => setShowAddModal(true)}>
                      Ajouter le premier sujet
                    </Button>
                  </td>
                </tr>
              ) : (
                sujets.map((sujet) => (
                  <tr key={sujet.id}>
                    <td>Séquence {sujet.sequence}</td>
                    <td>{sujet.anneeScolaire}</td>
                    <td>{sujet.etablissement}</td>
                    <td>{sujet.examinateur}</td>
                    <td>
                      {sujet.url_doc && (
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => previewSujet(sujet.url_doc)}
                        >
                          Voir
                        </Button>
                      )}
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleEditSujet(sujet)}
                          disabled={processing}
                        >
                          Modifier
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => confirmDelete(sujet)}
                          disabled={processing}
                        >
                          Supprimer
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal pour ajouter/modifier un sujet */}
      <Modal show={showAddModal} onHide={() => {
        if (!processing) {
          setShowAddModal(false);
          setCurrentEditSujet(null);
        }
      }} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {currentEditSujet ? 'Modifier le sujet' : 'Ajouter un sujet'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const sujetData = {
              id: currentEditSujet?.id || `sujet_${Date.now()}`,
              anneeScolaire: formData.get('anneeScolaire'),
              etablissement: formData.get('etablissement'),
              examinateur: formData.get('examinateur'),
              url_doc: formData.get('url_doc'),
              sequence: formData.get('sequence')
            };
            
            if (currentEditSujet) {
              handleUpdateSujet(sujetData);
            } else {
              handleAddSujet(sujetData);
            }
          }}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Séquence *</Form.Label>
                  <Form.Select name="sequence" required defaultValue={currentEditSujet?.sequence}>
                    <option value="">Sélectionner une séquence</option>
                    {SEQUENCES.map(seq => (
                      <option key={seq} value={seq}>
                        Séquence {seq}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Année scolaire *</Form.Label>
                  <Form.Control
                    type="text"
                    name="anneeScolaire"
                    placeholder="Ex: 2023-2024"
                    required
                    defaultValue={currentEditSujet?.anneeScolaire}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Établissement *</Form.Label>
              <Form.Control
                type="text"
                name="etablissement"
                placeholder="Nom de l'établissement"
                required
                defaultValue={currentEditSujet?.etablissement}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Examinateur</Form.Label>
              <Form.Control
                type="text"
                name="examinateur"
                placeholder="Nom de l'examinateur"
                defaultValue={currentEditSujet?.examinateur}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>URL du document *</Form.Label>
              <Form.Control
                type="url"
                name="url_doc"
                placeholder="https://example.com/sujet.html"
                required
                defaultValue={currentEditSujet?.url_doc}
              />
              <Form.Text className="text-muted">
                URL vers le document HTML du sujet
              </Form.Text>
            </Form.Group>

            <div className="d-flex gap-2 justify-content-end">
              <Button
                variant="secondary"
                onClick={() => {
                  if (!processing) {
                    setShowAddModal(false);
                    setCurrentEditSujet(null);
                  }
                }}
                disabled={processing}
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={processing}
              >
                {processing ? 'Traitement...' : currentEditSujet ? 'Modifier' : 'Ajouter'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal de confirmation pour la suppression */}
      <ConfirmModal
        show={showConfirmModal}
        onHide={() => setShowConfirmModal(false)}
        title="Confirmer la suppression"
        message={`Êtes-vous sûr de vouloir supprimer le sujet de ${sujetToDelete?.etablissement} (Séquence ${sujetToDelete?.sequence}) ?`}
        confirmText="Supprimer"
        cancelText="Annuler"
        onConfirm={handleDeleteSujet}
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

export default SujetsPage;