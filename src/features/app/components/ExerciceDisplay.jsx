import React from 'react';
import { Card, Badge, Button, Image, Accordion } from 'react-bootstrap';
import { MathJax, MathJaxContext } from 'better-react-mathjax';

const ExerciceDisplay = ({ 
  exercice, 
  onEdit, 
  onDelete,
  enableActions = true
}) => {
  // Configuration MathJax
  const config = {
    loader: { load: ["[tex]/html"] },
    tex: {
      packages: { "[+]": ["html"] },
      inlineMath: [["$", "$"]],
      displayMath: [["$$", "$$"]],
      processHtmlClass: "mathjax-process"
    }
  };

  // Fonction pour rendre du HTML avec MathJax
  const renderHtmlWithMath = (htmlContent) => {
    return (
      <div className="mathjax-process" dangerouslySetInnerHTML={{ __html: htmlContent }} />
    );
  };

  // Fonction pour afficher une question et ses sous-questions
  const renderQuestion = (question, isSubquestion = false) => {
    return (
      <div key={`${question.numero}-${isSubquestion}`} className={`mb-3 ${isSubquestion ? 'ms-4 ps-2 border-start' : ''}`}>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <Badge bg={getDifficultyColor(question.niveau)} className="me-2">
              {formatDifficulty(question.niveau)}
            </Badge>
            <strong>{question.numero}.</strong>
          </div>
        </div>
        
        <div className="ps-3">
          <MathJax dynamic>
            {renderHtmlWithMath(question.texte)}
          </MathJax>
        </div>

        {/* Affichage des sous-questions */}
        {question.sousQuestions && question.sousQuestions.map(sq => 
          renderQuestion(sq, true)
        )}
      </div>
    );
  };

  return (
    <MathJaxContext config={config}>
      <Card className="mb-4">
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <Badge bg={getTypeColor(exercice.type)} className="me-2">
                {formatType(exercice.type)}
              </Badge>
              <Badge bg={getDifficultyColor(exercice.niveau)}>
                {formatDifficulty(exercice.niveau)}
              </Badge>
            </div>
            
            {enableActions && (
              <div>
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  onClick={() => onEdit(exercice)}
                  className="me-2"
                >
                  Modifier
                </Button>
                <Button 
                  variant="outline-danger" 
                  size="sm"
                  onClick={() => onDelete(exercice)}
                >
                  Supprimer
                </Button>
              </div>
            )}
          </div>
          {exercice.intitule && <h5 className="mt-2 mb-0">{exercice.intitule}</h5>}
        </Card.Header>
        
        <Card.Body>
          {/* Section Énoncé */}
          <div className="mb-4">
            <h5 className="text-primary">Énoncé</h5>
            <div className="ps-3">
              <MathJax dynamic>
                {renderHtmlWithMath(exercice.enonce.texte)}
              </MathJax>
            </div>
            
            {/* Affichage des images de l'énoncé */}
            {exercice.enonce.images && exercice.enonce.images.length > 0 && (
              <div className="mt-3 d-flex flex-wrap gap-3">
                {exercice.enonce.images.map((img, index) => (
                  <Image 
                    key={index} 
                    src={img} 
                    alt={`Illustration ${index + 1}`} 
                    fluid 
                    className="border rounded p-2"
                    style={{ maxHeight: '200px' }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Section Questions */}
          <div className="mb-2">
            <h5 className="text-primary">Questions</h5>
            <div className="ps-2">
              {exercice.questions.map(question => renderQuestion(question))}
            </div>
          </div>
        </Card.Body>
        
        <Card.Footer className="text-muted small">
          <div className="d-flex justify-content-between">
            <span>Créé le: {exercice.createdAt?.toLocaleDateString()}</span>
            <span>Modifié le: {exercice.updatedAt?.toLocaleDateString()}</span>
          </div>
        </Card.Footer>
      </Card>
    </MathJaxContext>
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

const getTypeColor = (type) => {
  switch (type) {
    case 'ressource': return 'info';
    case 'competence': return 'purple';
    default: return 'secondary';
  }
};

const formatType = (type) => {
  const map = {
    'ressource': 'Ressource',
    'competence': 'Compétence'
  };
  return map[type] || type;
};

export default ExerciceDisplay;