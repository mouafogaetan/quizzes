import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { 
  getAllQuestions,
  saveQuestion,
  deleteQuestion
} from '../../../utils/crudfirestore';
import QuestionsList from '../components/QuestionList';
import QuestionEditModal from '../components/QuestionEditModal';
import ConfirmModal from '../components/ConfirmModal';
import { Button, Spinner, Alert } from 'react-bootstrap';

const LessonQuestionsPage = () => {
  const { classeId, matiereId, moduleId, chapitreId, lessonId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  // Charger les questions initiales
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true);
        const questionsData = await getAllQuestions(
          classeId, matiereId, moduleId, chapitreId, lessonId
        );
        setQuestions(questionsData);
      } catch (err) {
        setError('Erreur lors du chargement des questions');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [classeId, matiereId, moduleId, chapitreId, lessonId]);

  // Gestion de la sauvegarde d'une question
  const handleSaveQuestion = async (questionData) => {
    try {
      setProcessing(true);
      
      const isUpdate = !!currentQuestion?.id;
      const questionId = await saveQuestion(
        classeId, matiereId, moduleId, chapitreId, lessonId,
        isUpdate ? currentQuestion.id : null,
        questionData
      );

      // Mise à jour de l'état local
      if (isUpdate) {
        setQuestions(questions.map(q => 
          q.id === currentQuestion.id ? { ...questionData, id: questionId } : q
        ));
      } else {
        setQuestions([...questions, { ...questionData, id: questionId }]);
      }

      setShowEditModal(false);
    } catch (err) {
      setError(`Erreur lors de ${currentQuestion?.id ? 'la mise à jour' : "l'ajout"} de la question`);
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  // Gestion de la suppression d'une question
  const handleDeleteQuestion = async () => {
    try {
      setProcessing(true);
      await deleteQuestion(
        classeId, matiereId, moduleId, chapitreId, lessonId, currentQuestion.id
      );
      setQuestions(questions.filter(q => q.id !== currentQuestion.id));
      setShowDeleteModal(false);
    } catch (err) {
      setError('Erreur lors de la suppression de la question');
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  // Gestion de l'import de questions
  const handleImportQuestions = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setImporting(true);
      setError(null);

      // Lecture du fichier
      const fileContent = await readFileAsText(file);
      const importedQuestions = JSON.parse(fileContent);

      // Validation du format
      if (!Array.isArray(importedQuestions)) {
        throw new Error("Le fichier doit contenir un tableau de questions");
      }

      // Sauvegarde des questions
      for (const question of importedQuestions) {
        await saveQuestion(
          classeId, matiereId, moduleId, chapitreId, lessonId,
          null, // Nouvelle question
          {
            questionText: question.questionText || '',
            options: question.options || ['', ''],
            correctAnswer: question.correctAnswer || 0,
            difficulty: question.difficulty || 'medium',
            explanation: question.explanation || ''
          }
        );
      }

      // Recharger les questions
      const updatedQuestions = await getAllQuestions(
        classeId, matiereId, moduleId, chapitreId, lessonId
      );
      setQuestions(updatedQuestions);

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
        <p>Chargement des questions...</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h1>Gestion des Questions</h1>
      
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
            setCurrentQuestion({
              questionText: '',
              options: ['', ''],
              correctAnswer: 0,
              difficulty: 'medium',
              explanation: ''
            });
            setShowEditModal(true);
          }}
          disabled={processing || importing}
        >
          Ajouter une Question
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
            'Importer des questions'
          )}
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImportQuestions}
          accept=".json,application/json"
          style={{ display: 'none' }}
          disabled={importing}
        />
      </div>

      {importing && (
        <div className="mb-3">
          <div className="d-flex align-items-center">
            <Spinner animation="border" size="sm" className="me-2" />
            <span>Importation des questions en cours...</span>
          </div>
        </div>
      )}

      <QuestionsList 
        questions={questions} 
        onEdit={(question) => {
          setCurrentQuestion(question);
          setShowEditModal(true);
        }}
        onDelete={(question) => {
          setCurrentQuestion(question);
          setShowDeleteModal(true);
        }}
        disabled={processing || importing}
      />

      {/* Modal d'édition */}
      <QuestionEditModal
        show={showEditModal}
        onHide={() => !processing && setShowEditModal(false)}
        question={currentQuestion}
        onSave={handleSaveQuestion}
        isProcessing={processing}
      />

      {/* Modal de confirmation de suppression */}
      <ConfirmModal
        show={showDeleteModal}
        onHide={() => !processing && setShowDeleteModal(false)}
        title="Confirmer la suppression"
        message={`Êtes-vous sûr de vouloir supprimer cette question ?`}
        confirmText="Supprimer"
        cancelText="Annuler"
        onConfirm={handleDeleteQuestion}
        confirmVariant="danger"
        disabled={processing}
      />
    </div>
  );
};

export default LessonQuestionsPage;