import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { 
  getAllExercicesVideo,
  saveExerciceVideo,
  deleteExerciceVideo 
} from '../../../utils/crudfirestore';
import ExerciceVideo from '../components/ExerciceVideo';
import ExerciceVideoEditModal from '../components/ExerciceVideoEditModal';
import ConfirmModal from '../components/ConfirmModal';
import { Button, Spinner, Alert, Card } from 'react-bootstrap';
import { FaYoutube, FaPlus, FaUpload } from 'react-icons/fa';

const LessonExercicesVideoPage = () => {
  const { classeId, matiereId, moduleId, chapitreId, lessonId } = useParams();
  const [exercices, setExercices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentExercice, setCurrentExercice] = useState(null);
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef(null);

  // Charger les exercices vidéo
  useEffect(() => {
    const loadExercices = async () => {
      try {
        setLoading(true);
        const exercicesData = await getAllExercicesVideo(
          classeId, matiereId, moduleId, chapitreId, lessonId
        );
        setExercices(exercicesData);
      } catch (err) {
        setError('Erreur lors du chargement des exercices vidéo');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadExercices();
  }, [classeId, matiereId, moduleId, chapitreId, lessonId]);

  // Sauvegarder un exercice vidéo
  const handleSaveExercice = async (exerciceData) => {
    try {
      setProcessing(true);
      
      const isUpdate = !!currentExercice?.id;
      const exerciceId = await saveExerciceVideo(
        classeId, matiereId, moduleId, chapitreId, lessonId,
        isUpdate ? currentExercice.id : null,
        exerciceData
      );

      // Mise à jour de l'état local
      if (isUpdate) {
        setExercices(exercices.map(e => 
          e.id === currentExercice.id ? { ...exerciceData, id: exerciceId } : e
        ));
      } else {
        setExercices([...exercices, { ...exerciceData, id: exerciceId }]);
      }

      setShowEditModal(false);
    } catch (err) {
      setError(`Erreur lors de ${currentExercice?.id ? 'la mise à jour' : "l'ajout"} de l'exercice`);
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  // Supprimer un exercice vidéo
  const handleDeleteExercice = async () => {
    try {
      setProcessing(true);
      await deleteExerciceVideo(
        classeId, matiereId, moduleId, chapitreId, lessonId, currentExercice.id
      );
      setExercices(exercices.filter(e => e.id !== currentExercice.id));
      setShowDeleteModal(false);
    } catch (err) {
      setError('Erreur lors de la suppression de l\'exercice');
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  // Importer des exercices vidéo
  const handleImportExercices = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setProcessing(true);
      setError(null);

      const fileContent = await readFileAsText(file);
      const importedExercices = JSON.parse(fileContent);

      if (!Array.isArray(importedExercices)) {
        throw new Error("Le fichier doit contenir un tableau d'exercices");
      }

      for (const exercice of importedExercices) {
        await saveExerciceVideo(
          classeId, matiereId, moduleId, chapitreId, lessonId,
          null,
          {
            titre: exercice.titre || '',
            youtubeUrl: exercice.youtubeUrl || '',
            description: exercice.description || ''
          }
        );
      }

      // Recharger les exercices
      const updatedExercices = await getAllExercicesVideo(
        classeId, matiereId, moduleId, chapitreId, lessonId
      );
      setExercices(updatedExercices);

    } catch (err) {
      setError(`Erreur lors de l'import: ${err.message}`);
      console.error(err);
    } finally {
      setProcessing(false);
      e.target.value = '';
    }
  };

  const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target.result);
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" />
        <p>Chargement des exercices vidéo...</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>
          <FaYoutube className="text-danger me-2" />
          Exercices Vidéo
        </h1>
        
        <div className="d-flex gap-2">
          <Button 
            variant="primary" 
            onClick={() => {
              setCurrentExercice({
                titre: '',
                youtubeUrl: '',
                description: ''
              });
              setShowEditModal(true);
            }}
            disabled={processing}
          >
            <FaPlus className="me-2" />
            Ajouter un exercice
          </Button>

          <Button 
            variant="success"
            onClick={() => fileInputRef.current.click()}
            disabled={processing}
          >
            <FaUpload className="me-2" />
            Importer
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportExercices}
            accept=".json,application/json"
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
          <Button 
            variant="link" 
            onClick={() => window.location.reload()}
            className="p-0 ms-2"
          >
            Réessayer
          </Button>
        </Alert>
      )}

      {exercices.length === 0 ? (
        <Card className="text-center py-5">
          <Card.Body>
            <FaYoutube size={48} className="text-muted mb-3" />
            <h5 className="text-muted">Aucun exercice vidéo disponible</h5>
            <p className="text-muted mb-0">
              Commencez par ajouter votre premier exercice vidéo
            </p>
          </Card.Body>
        </Card>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 g-4">
          {exercices.map(exercice => (
            <div key={exercice.id} className="col">
              <ExerciceVideo 
                exercice={exercice}
                onEdit={() => {
                  setCurrentExercice(exercice);
                  setShowEditModal(true);
                }}
                onDelete={() => {
                  setCurrentExercice(exercice);
                  setShowDeleteModal(true);
                }}
                enableActions={!processing}
              />
            </div>
          ))}
        </div>
      )}

      {/* Modal d'édition */}
      <ExerciceVideoEditModal
        show={showEditModal}
        onHide={() => !processing && setShowEditModal(false)}
        exercice={currentExercice}
        onSave={handleSaveExercice}
        isProcessing={processing}
      />

      {/* Modal de confirmation de suppression */}
      <ConfirmModal
        show={showDeleteModal}
        onHide={() => !processing && setShowDeleteModal(false)}
        title="Confirmer la suppression"
        message={`Êtes-vous sûr de vouloir supprimer l'exercice "${currentExercice?.titre}" ?`}
        confirmText="Supprimer"
        cancelText="Annuler"
        onConfirm={handleDeleteExercice}
        confirmVariant="danger"
        disabled={processing}
      />
    </div>
  );
};

export default LessonExercicesVideoPage;