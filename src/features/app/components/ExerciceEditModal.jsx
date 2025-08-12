import React, { useState, useEffect, useRef } from 'react';
import { Modal, Form, Button, Image, Row, Col, Accordion, Badge } from 'react-bootstrap';
import { compressImage } from '../../../utils/imageUtils';

const ExerciceEditModal = ({ show, onHide, exercice, onSave }) => {
  const [formData, setFormData] = useState({
    intitule: '',
    type: 'ressource',
    niveau: 'medium',
    enonce: { texte: '', images: [] },
    questions: []
  });

  const fileInputRef = useRef(null);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(null);

  // Initialisation des données lors de l'édition
  useEffect(() => {
    if (exercice) {
      setFormData({
        intitule: exercice.intitule || '',
        type: exercice.type || 'ressource',
        niveau: exercice.niveau || 'medium',
        enonce: {
          texte: exercice.enonce?.texte || '',
          images: exercice.enonce?.images || []
        },
        questions: exercice.questions || []
      });
    } else {
      setFormData({
        intitule: '',
        type: 'ressource',
        niveau: 'medium',
        enonce: { texte: '', images: [] },
        questions: []
      });
    }
  }, [exercice]);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files).slice(0, 3); // Max 3 images
    if (files.length === 0) return;

    try {
      const compressedImages = await Promise.all(
        files.map(file => compressImage(file, 300))
      );
      
      setFormData(prev => ({
        ...prev,
        enonce: {
          ...prev.enonce,
          images: [...prev.enonce.images, ...compressedImages].slice(0, 3)
        }
      }));
    } catch (error) {
      console.error("Erreur lors de la compression des images:", error);
      alert("Erreur lors du traitement des images");
    }
  };

  const removeImage = (index) => {
    const newImages = [...formData.enonce.images];
    newImages.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      enonce: {
        ...prev.enonce,
        images: newImages
      }
    }));
  };

  const handleTextChange = (field, value) => {
    if (field === 'enonce.texte') {
      setFormData(prev => ({
        ...prev,
        enonce: {
          ...prev.enonce,
          texte: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  // Gestion des questions
  const addQuestion = () => {
    const newQuestion = {
      numero: formData.questions.length + 1,
      texte: '',
      niveau: 'medium',
      reponse: '', // Ajout du champ réponse
      sousQuestions: []
    };
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
    setActiveQuestionIndex(formData.questions.length);
  };

  const updateQuestion = (index, updatedQuestion) => {
    const newQuestions = [...formData.questions];
    newQuestions[index] = updatedQuestion;
    setFormData(prev => ({ ...prev, questions: newQuestions }));
  };

  const removeQuestion = (index) => {
    const newQuestions = formData.questions.filter((_, i) => i !== index);
    // Réorganiser les numéros
    const renumberedQuestions = newQuestions.map((q, i) => ({
      ...q,
      numero: i + 1
    }));
    setFormData(prev => ({ ...prev, questions: renumberedQuestions }));
    setActiveQuestionIndex(null);
  };

  const addSubQuestion = (questionIndex) => {
    const question = formData.questions[questionIndex];
    const subQuestionCount = question.sousQuestions?.length || 0;
    const newSubQuestion = {
      numero: `${question.numero}.${String.fromCharCode(97 + subQuestionCount)}`,
      texte: '',
      niveau: 'medium',
      reponse: '' // Ajout du champ réponse
    };
    
    const updatedQuestion = {
      ...question,
      sousQuestions: [...(question.sousQuestions || []), newSubQuestion]
    };
    
    updateQuestion(questionIndex, updatedQuestion);
  };

  const updateSubQuestion = (questionIndex, subQuestionIndex, updatedSubQuestion) => {
    const question = formData.questions[questionIndex];
    const newSubQuestions = [...question.sousQuestions];
    newSubQuestions[subQuestionIndex] = updatedSubQuestion;
    
    const updatedQuestion = {
      ...question,
      sousQuestions: newSubQuestions
    };
    
    updateQuestion(questionIndex, updatedQuestion);
  };

  const removeSubQuestion = (questionIndex, subQuestionIndex) => {
    const question = formData.questions[questionIndex];
    const newSubQuestions = question.sousQuestions.filter((_, i) => i !== subQuestionIndex);
    
    // Renuméroter les sous-questions
    const renumberedSubQuestions = newSubQuestions.map((sq, i) => ({
      ...sq,
      numero: `${question.numero}.${String.fromCharCode(97 + i)}`
    }));
    
    const updatedQuestion = {
      ...question,
      sousQuestions: renumberedSubQuestions
    };
    
    updateQuestion(questionIndex, updatedQuestion);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (formData.questions.length === 0) {
      alert("Veuillez ajouter au moins une question à l'exercice");
      return;
    }
    
    // Formatage des données pour la sauvegarde
    const formattedData = {
      ...formData,
      questions: formData.questions.map(q => ({
        ...q,
        sousQuestions: q.sousQuestions || []
      }))
    };
    
    onSave(formattedData);
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" scrollable>
      <Modal.Header closeButton>
        <Modal.Title>{exercice?.id ? 'Modifier' : 'Créer'} un Exercice</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {/* Informations générales */}
          <Row className="mb-4">
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Titre de l'exercice</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.intitule}
                  onChange={(e) => handleTextChange('intitule', e.target.value)}
                />
              </Form.Group>
            </Col>
            
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Type</Form.Label>
                <Form.Select
                  value={formData.type}
                  onChange={(e) => handleTextChange('type', e.target.value)}
                >
                  <option value="ressource">Ressource</option>
                  <option value="competence">Compétence</option>
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Difficulté globale</Form.Label>
                <Form.Select
                  value={formData.niveau}
                  onChange={(e) => handleTextChange('niveau', e.target.value)}
                >
                  <option value="easy">Facile</option>
                  <option value="medium">Moyen</option>
                  <option value="hard">Difficile</option>
                  <option value="very hard">Très difficile</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {/* Énoncé */}
          <Form.Group className="mb-4">
            <Form.Label>Énoncé de l'exercice</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={formData.enonce.texte}
              onChange={(e) => handleTextChange('enonce.texte', e.target.value)}
              required
            />
            
            <div className="mt-3">
              <Button 
                variant="outline-secondary"
                size="sm"
                onClick={() => fileInputRef.current.click()}
                disabled={formData.enonce.images.length >= 3}
              >
                Ajouter des images (max 3)
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                multiple
                style={{ display: 'none' }}
              />
              
              <div className="d-flex flex-wrap gap-3 mt-2">
                {formData.enonce.images.map((img, index) => (
                  <div key={index} className="position-relative">
                    <Image 
                      src={img} 
                      thumbnail 
                      style={{ maxWidth: 100, maxHeight: 100 }} 
                    />
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="position-absolute top-0 start-100 translate-middle"
                      onClick={() => removeImage(index)}
                      style={{ color: 'red' }}
                    >
                      <i className="bi bi-x-circle-fill"></i>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </Form.Group>

          {/* Questions */}
          <Form.Group className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <Form.Label className="mb-0">Questions</Form.Label>
              <Button variant="primary" size="sm" onClick={addQuestion}>
                + Ajouter une question
              </Button>
            </div>
            
            <Accordion activeKey={activeQuestionIndex?.toString()} onSelect={(e) => setActiveQuestionIndex(e ? parseInt(e) : null)}>
              {formData.questions.map((question, qIndex) => (
                <Accordion.Item key={qIndex} eventKey={qIndex.toString()}>
                  <Accordion.Header>
                    <div className="d-flex align-items-center">
                      <span className="me-2 fw-bold">Question {question.numero}</span>
                      <Badge bg={getDifficultyColor(question.niveau)} className="me-2">
                        {formatDifficulty(question.niveau)}
                      </Badge>
                    </div>
                  </Accordion.Header>
                  <Accordion.Body>
                    <QuestionEditor
                      question={question}
                      onUpdate={(updated) => updateQuestion(qIndex, updated)}
                      onDelete={() => removeQuestion(qIndex)}
                      onAddSubQuestion={() => addSubQuestion(qIndex)}
                      onUpdateSubQuestion={(sqIndex, updated) => 
                        updateSubQuestion(qIndex, sqIndex, updated)
                      }
                      onDeleteSubQuestion={(sqIndex) => 
                        removeSubQuestion(qIndex, sqIndex)
                      }
                    />
                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
            
            {formData.questions.length === 0 && (
              <div className="text-center text-muted py-4">
                Aucune question ajoutée à cet exercice
              </div>
            )}
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Annuler
          </Button>
          <Button variant="primary" type="submit">
            Sauvegarder
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

// Composant interne pour l'édition d'une question
const QuestionEditor = ({ 
  question, 
  onUpdate, 
  onDelete,
  onAddSubQuestion,
  onUpdateSubQuestion,
  onDeleteSubQuestion
}) => {
  const handleChange = (field, value) => {
    onUpdate({ ...question, [field]: value });
  };

  const handleSubQuestionChange = (index, field, value) => {
    const newSubQuestions = [...question.sousQuestions];
    newSubQuestions[index] = { ...newSubQuestions[index], [field]: value };
    onUpdate({ ...question, sousQuestions: newSubQuestions });
  };

  return (
    <div>
      <Form.Group className="mb-3">
        <Form.Label>Texte de la question</Form.Label>
        <Form.Control
          as="textarea"
          rows={2}
          value={question.texte}
          onChange={(e) => handleChange('texte', e.target.value)}
          required
        />
      </Form.Group>
      
      <Form.Group className="mb-3">
        <Form.Label>Réponse à la question</Form.Label>
        <Form.Control
          as="textarea"
          rows={2}
          value={question.reponse || ''}
          onChange={(e) => handleChange('reponse', e.target.value)}
          placeholder="Entrez la réponse attendue"
        />
      </Form.Group>
      
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Niveau de difficulté</Form.Label>
            <Form.Select
              value={question.niveau}
              onChange={(e) => handleChange('niveau', e.target.value)}
            >
              <option value="easy">Facile</option>
              <option value="medium">Moyen</option>
              <option value="hard">Difficile</option>
              <option value="very hard">Très difficile</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>
      
      {/* Sous-questions */}
      <div className="mb-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <Form.Label className="mb-0">Sous-questions</Form.Label>
          <Button 
            variant="outline-primary" 
            size="sm" 
            onClick={onAddSubQuestion}
          >
            + Ajouter une sous-question
          </Button>
        </div>
        
        {question.sousQuestions?.length > 0 ? (
          <div className="border rounded p-3">
            {question.sousQuestions.map((subQuestion, sqIndex) => (
              <div key={sqIndex} className="mb-3 border-bottom pb-3">
                <Row>
                  <Col md={1}>
                    <Form.Control
                      type="text"
                      value={subQuestion.numero}
                      readOnly
                      plaintext
                    />
                  </Col>
                  <Col md={7}>
                    <Form.Control
                      type="text"
                      value={subQuestion.texte}
                      onChange={(e) => 
                        onUpdateSubQuestion(sqIndex, 'texte', e.target.value)
                      }
                      placeholder="Texte de la sous-question"
                      required
                    />
                  </Col>
                  <Col md={3}>
                    <Form.Select
                      value={subQuestion.niveau}
                      onChange={(e) => 
                        onUpdateSubQuestion(sqIndex, 'niveau', e.target.value)
                      }
                    >
                      <option value="easy">Facile</option>
                      <option value="medium">Moyen</option>
                      <option value="hard">Difficile</option>
                      <option value="very hard">Très difficile</option>
                    </Form.Select>
                  </Col>
                  <Col md={1} className="text-end">
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="text-danger"
                      onClick={() => onDeleteSubQuestion(sqIndex)}
                    >
                      <i className="bi bi-trash"></i>
                    </Button>
                  </Col>
                </Row>
                <Row className="mt-2">
                  <Col md={12}>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={subQuestion.reponse || ''}
                      onChange={(e) => 
                        onUpdateSubQuestion(sqIndex, 'reponse', e.target.value)
                      }
                      placeholder="Réponse attendue pour cette sous-question"
                    />
                  </Col>
                </Row>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-muted small">
            Aucune sous-question pour cette question
          </div>
        )}
      </div>
      
      <div className="d-flex justify-content-end">
        <Button 
          variant="outline-danger" 
          size="sm"
          onClick={onDelete}
        >
          Supprimer cette question
        </Button>
      </div>
    </div>
  );
};

// Helper functions
const getDifficultyColor = (difficulty) => {
  switch (difficulty) {
    case 'easy': return 'success';
    case 'medium': return 'primary';
    case 'hard': return 'warning';
    case 'very hard': return 'danger';
    default: return 'secondary';
  }
};

const formatDifficulty = (difficulty) => {
  const map = {
    'easy': 'Facile',
    'medium': 'Moyen',
    'hard': 'Difficile',
    'very hard': 'Très difficile'
  };
  return map[difficulty] || difficulty;
};

export default ExerciceEditModal;