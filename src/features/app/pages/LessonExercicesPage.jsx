import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { 
  getAllExercices,
  saveExercice,
  deleteExercice
} from '../../../utils/crudfirestore';
import ExerciceDisplay from '../components/ExerciceDisplay';
import ExerciceEditModal from '../components/ExerciceEditModal';
import ConfirmModal from '../components/ConfirmModal';
import { Button, Spinner, Alert } from 'react-bootstrap';

const LessonExercicesPage = () => {
  const { classeId, matiereId, moduleId, chapitreId, lessonId } = useParams();
  const [exercices, setExercices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentExercice, setCurrentExercice] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  // Charger les exercices initiaux
  useEffect(() => {
    const loadExercices = async () => {
      try {
        setLoading(true);
        const exercicesData = await getAllExercices(
          classeId, matiereId, moduleId, chapitreId, lessonId
        );
        setExercices(exercicesData);
      } catch (err) {
        setError('Erreur lors du chargement des exercices');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadExercices();
  }, [classeId, matiereId, moduleId, chapitreId, lessonId]);

  // Gestion de la sauvegarde d'un exercice
  const handleSaveExercice = async (exerciceData) => {
    try {
      setProcessing(true);
      
      const isUpdate = !!currentExercice?.id;
      const exerciceId = await saveExercice(
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

  // Gestion de la suppression d'un exercice
  const handleDeleteExercice = async () => {
    try {
      setProcessing(true);
      await deleteExercice(
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

  // Gestion de l'import d'exercices
  const handleImportExercices = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setImporting(true);
      setError(null);

      // Lecture du fichier
      const fileContent = await readFileAsText(file);
      const importedExercices = JSON.parse(fileContent);

      // Validation du format
      if (!Array.isArray(importedExercices)) {
        throw new Error("Le fichier doit contenir un tableau d'exercices");
      }

      // Sauvegarde des exercices
      for (const exercice of importedExercices) {
        await saveExercice(
          classeId, matiereId, moduleId, chapitreId, lessonId,
          null, // Nouvel exercice
          {
            intitule: exercice.intitule || '',
            type: exercice.type || 'ressource',
            niveau: exercice.niveau || 'medium',
            enonce: {
              texte: exercice.enonce?.texte || '',
              images: exercice.enonce?.images || []
            },
            questions: exercice.questions || []
          }
        );
      }

      // Recharger les exercices
      const updatedExercices = await getAllExercices(
        classeId, matiereId, moduleId, chapitreId, lessonId
      );
      setExercices(updatedExercices);

    } catch (err) {
      setError(`Erreur lors de l'import: ${err.message}`);
      console.error(err);
    } finally {
      setImporting(false);
      e.target.value = ''; // Permet de re-sélectionner le même fichier
    }
  };

  // Helper pour lire un fichier comme texte
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
        <p>Chargement des exercices...</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h1>Gestion des Exercices</h1>
      
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

      <div className="mb-3 d-flex gap-2">
        <Button 
          variant="primary" 
          onClick={() => {
            setCurrentExercice({
              intitule: '',
              type: 'ressource',
              niveau: 'medium',
              enonce: { texte: '', images: [] },
              questions: []
            });
            setShowEditModal(true);
          }}
          disabled={processing || importing}
        >
          Ajouter un Exercice
        </Button>

        <Button 
          variant="success"
          onClick={() => fileInputRef.current.click()}
          disabled={processing || importing}
        >
          {importing ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Import en cours...
            </>
          ) : (
            'Importer des exercices'
          )}
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImportExercices}
          accept=".json,application/json"
          style={{ display: 'none' }}
          disabled={importing}
        />
      </div>

      {importing && (
        <div className="mb-3">
          <div className="d-flex align-items-center">
            <Spinner animation="border" size="sm" className="me-2" />
            <span>Importation des exercices en cours...</span>
          </div>
        </div>
      )}

      {exercices.length === 0 && !loading ? (
        <div className="text-center py-5 bg-light rounded">
          <p className="text-muted">Aucun exercice disponible pour cette leçon</p>
          <Button 
            variant="primary" 
            onClick={() => {
              setCurrentExercice({
                intitule: '',
                type: 'ressource',
                niveau: 'medium',
                enonce: { texte: '', images: [] },
                questions: []
              });
              setShowEditModal(true);
            }}
          >
            Créer votre premier exercice
          </Button>
        </div>
      ) : (
        <div className="exercices-list">
          {exercices.map(exercice => (
            <div key={exercice.id} className="mb-4">
              <ExerciceDisplay 
                exercice={exercice}
                onEdit={() => {
                  setCurrentExercice(exercice);
                  setShowEditModal(true);
                }}
                onDelete={() => {
                  setCurrentExercice(exercice);
                  setShowDeleteModal(true);
                }}
                enableActions={!processing && !importing}
              />
            </div>
          ))}
        </div>
      )}

      {/* Modal d'édition */}
      <ExerciceEditModal
        show={showEditModal}
        onHide={() => !processing && setShowEditModal(false)}
        exercice={currentExercice}
        onSave={handleSaveExercice}
      />

      {/* Modal de confirmation de suppression */}
      <ConfirmModal
        show={showDeleteModal}
        onHide={() => !processing && setShowDeleteModal(false)}
        title="Confirmer la suppression"
        message={`Êtes-vous sûr de vouloir supprimer cet exercice ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        onConfirm={handleDeleteExercice}
        confirmVariant="danger"
        disabled={processing}
      />
    </div>
  );
};

export default LessonExercicesPage;