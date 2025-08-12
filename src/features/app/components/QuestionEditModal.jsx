import React, { useState, useEffect, useRef } from 'react';
import { Modal, Form, Button, Image, Row, Col } from 'react-bootstrap';
import { compressImage, extractTextAndImages } from '../../../utils/imageUtils';

const QuestionEditModal = ({ show, onHide, question, onSave }) => {
  const [formData, setFormData] = useState({
    questionText: { text: '', image: null },
    options: [
      { text: '', image: null },
      { text: '', image: null }
    ],
    correctAnswer: 0,
    difficulty: 'medium',
    explanation: { text: '', image: null }
  });

  const fileInputRefs = useRef({
    question: null,
    explanation: null,
    options: []
  });

  // Initialisation des refs pour les options
  useEffect(() => {
    fileInputRefs.current.options = formData.options.map(() => React.createRef());
  }, [formData.options]);

  // Parse le contenu existant lors de l'édition
  useEffect(() => {
    if (question) {
      const parsedData = {
        questionText: extractTextAndImages(question.questionText || ''),
        options: (question.options || ['', '']).map(opt => extractTextAndImages(opt)),
        correctAnswer: question.correctAnswer || 0,
        difficulty: question.difficulty || 'medium',
        explanation: extractTextAndImages(question.explanation || '')
      };
      setFormData(parsedData);
    } else {
      setFormData({
        questionText: { text: '', image: null },
        options: [
          { text: '', image: null },
          { text: '', image: null }
        ],
        correctAnswer: 0,
        difficulty: 'medium',
        explanation: { text: '', image: null }
      });
    }
  }, [question]);

  const handleImageUpload = async (e, field, index = null) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // Compression de l'image (max 300KB)
      const compressedImage = await compressImage(file, 300);
      
      if (index !== null) {
        // Mise à jour d'une option
        const newOptions = [...formData.options];
        newOptions[index].image = compressedImage;
        setFormData({ ...formData, options: newOptions });
      } else {
        // Mise à jour du texte de la question ou de l'explication
        setFormData({
          ...formData,
          [field]: {
            ...formData[field],
            image: compressedImage
          }
        });
      }
    } catch (error) {
      console.error("Erreur lors de la compression de l'image:", error);
      alert("Erreur lors du traitement de l'image");
    }
  };

  const removeImage = (field, index = null) => {
    if (index !== null) {
      const newOptions = [...formData.options];
      newOptions[index].image = null;
      setFormData({ ...formData, options: newOptions });
    } else {
      setFormData({
        ...formData,
        [field]: {
          ...formData[field],
          image: null
        }
      });
    }
  };

  const handleTextChange = (e, field, index = null) => {
    const value = e.target.value;
    
    if (index !== null) {
      const newOptions = [...formData.options];
      newOptions[index].text = value;
      setFormData({ ...formData, options: newOptions });
    } else {
      setFormData({
        ...formData,
        [field]: {
          ...formData[field],
          text: value
        }
      });
    }
  };

  const addOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, { text: '', image: null }]
    });
  };

  const removeOption = (index) => {
    if (formData.options.length <= 2) return;
    const newOptions = [...formData.options];
    newOptions.splice(index, 1);
    
    // Ajuster la bonne réponse si nécessaire
    let newCorrectAnswer = formData.correctAnswer;
    if (index === formData.correctAnswer) {
      newCorrectAnswer = 0;
    } else if (index < formData.correctAnswer) {
      newCorrectAnswer -= 1;
    }
    
    setFormData({
      ...formData,
      options: newOptions,
      correctAnswer: newCorrectAnswer
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Formatage des données pour la sauvegarde
    const formattedData = {
      questionText: formatContent(formData.questionText),
      options: formData.options.map(opt => formatContent(opt)),
      correctAnswer: formData.correctAnswer,
      difficulty: formData.difficulty,
      explanation: formatContent(formData.explanation)
    };
    
    onSave(formattedData);
    onHide();
  };

  // Formatte le contenu (texte + image) en HTML
  const formatContent = ({ text, image }) => {
    if (!image) return text;
    return `${text}<div><img src="${image}" style="max-width:200px; max-height:150px;" /></div>`;
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{question?.id ? 'Modifier' : 'Ajouter'} une Question</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {/* Question Text */}
          <Form.Group className="mb-3">
            <Form.Label>Question</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={formData.questionText.text}
              onChange={(e) => handleTextChange(e, 'questionText')}
              required
            />
            <div className="mt-2">
              <Button 
                variant="outline-secondary"
                size="sm"
                onClick={() => fileInputRefs.current.question.click()}
              >
                Ajouter une image
              </Button>
              <input
                type="file"
                ref={el => fileInputRefs.current.question = el}
                onChange={(e) => handleImageUpload(e, 'questionText')}
                accept="image/*"
                style={{ display: 'none' }}
              />
              {formData.questionText.image && (
                <div className="d-flex align-items-center mt-2">
                  <Image 
                    src={formData.questionText.image} 
                    thumbnail 
                    style={{ maxWidth: 50, maxHeight: 50 }} 
                    className="me-2"
                  />
                  <Button 
                    variant="link" 
                    size="sm" 
                    onClick={() => removeImage('questionText')}
                  >
                    <i className="bi bi-trash text-danger"></i>
                  </Button>
                </div>
              )}
            </div>
          </Form.Group>

          {/* Options */}
          <Form.Group className="mb-3">
            <Form.Label>Options (cochez la bonne réponse)</Form.Label>
            {formData.options.map((option, index) => (
              <div key={index} className="mb-3 p-2 border rounded">
                <div className="d-flex align-items-center mb-2">
                  <Form.Check
                    type="radio"
                    name="correctAnswer"
                    checked={index === formData.correctAnswer}
                    onChange={() => setFormData({ ...formData, correctAnswer: index })}
                    className="me-2"
                  />
                  <Form.Control
                    type="text"
                    value={option.text}
                    onChange={(e) => handleTextChange(e, null, index)}
                    placeholder={`Option ${index + 1}`}
                    required
                  />
                  {formData.options.length > 2 && (
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="ms-2 text-danger"
                      onClick={() => removeOption(index)}
                    >
                      <i className="bi bi-trash"></i>
                    </Button>
                  )}
                </div>
                <div className="d-flex align-items-center">
                  <Button 
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => fileInputRefs.current.options[index].click()}
                  >
                    Ajouter une image
                  </Button>
                  <input
                    type="file"
                    ref={el => fileInputRefs.current.options[index] = el}
                    onChange={(e) => handleImageUpload(e, null, index)}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                  {option.image && (
                    <div className="d-flex align-items-center ms-2">
                      <Image 
                        src={option.image} 
                        thumbnail 
                        style={{ maxWidth: 50, maxHeight: 50 }} 
                        className="me-2"
                      />
                      <Button 
                        variant="link" 
                        size="sm" 
                        onClick={() => removeImage(null, index)}
                      >
                        <i className="bi bi-trash text-danger"></i>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={addOption}
            >
              + Ajouter une option
            </Button>
          </Form.Group>

          {/* Difficulté */}
          <Form.Group className="mb-3">
            <Form.Label>Difficulté</Form.Label>
            <Form.Select
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
            >
              <option value="easy">Facile</option>
              <option value="medium">Moyen</option>
              <option value="hard">Difficile</option>
              <option value="very hard">Très difficile</option>
            </Form.Select>
          </Form.Group>

          {/* Explication */}
          <Form.Group className="mb-3">
            <Form.Label>Explication (facultative)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={formData.explanation.text}
              onChange={(e) => handleTextChange(e, 'explanation')}
            />
            <div className="mt-2">
              <Button 
                variant="outline-secondary"
                size="sm"
                onClick={() => fileInputRefs.current.explanation.click()}
              >
                Ajouter une image
              </Button>
              <input
                type="file"
                ref={el => fileInputRefs.current.explanation = el}
                onChange={(e) => handleImageUpload(e, 'explanation')}
                accept="image/*"
                style={{ display: 'none' }}
              />
              {formData.explanation.image && (
                <div className="d-flex align-items-center mt-2">
                  <Image 
                    src={formData.explanation.image} 
                    thumbnail 
                    style={{ maxWidth: 50, maxHeight: 50 }} 
                    className="me-2"
                  />
                  <Button 
                    variant="link" 
                    size="sm" 
                    onClick={() => removeImage('explanation')}
                  >
                    <i className="bi bi-trash text-danger"></i>
                  </Button>
                </div>
              )}
            </div>
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

export default QuestionEditModal;