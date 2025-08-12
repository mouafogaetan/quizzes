import React from 'react';
import { Card, ListGroup, Badge, Button, Form } from 'react-bootstrap';
import { MathJax, MathJaxContext } from 'better-react-mathjax';

const QuestionsList = ({ 
  questions, 
  onEdit, 
  onDelete,
  enableActions = true
}) => {
  // Configuration MathJax avec support HTML
  const config = {
    loader: { load: ["[tex]/html"] },
    tex: {
      packages: { "[+]": ["html"] },
      inlineMath: [["$", "$"]],
      displayMath: [["$$", "$$"]],
      processHtmlClass: "mathjax-process" // Classe pour les éléments à traiter
    }
  };

  // Fonction pour rendre du HTML avec MathJax
  const renderHtmlWithMath = (htmlContent) => {
    return (
      <div className="mathjax-process" dangerouslySetInnerHTML={{ __html: htmlContent }} />
    );
  };

  return (
    <MathJaxContext config={config}>
      <div className="questions-list">
        {questions.map((question) => (
          <Card key={question.id} className="mb-4">
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <Badge bg={getDifficultyColor(question.difficulty)}>
                  {formatDifficulty(question.difficulty)}
                </Badge>
                
                {enableActions && (
                  <div>
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      onClick={() => onEdit(question)}
                      className="me-2"
                    >
                      Modifier
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => onDelete(question)}
                    >
                      Supprimer
                    </Button>
                  </div>
                )}
              </div>
            </Card.Header>
            <Card.Body>
              {/* Section Énoncé */}
              <div className="mb-4">
                <h5 className="text-primary">Énoncé</h5>
                <div className="ps-3">
                  <MathJax dynamic>
                    {renderHtmlWithMath(question.questionText)}
                  </MathJax>
                </div>
              </div>

              {/* Section Options */}
              <div className="mb-4">
                <h5 className="text-primary">Options</h5>
                <ListGroup variant="flush">
                  {question.options.map((option, index) => (
                    <ListGroup.Item key={index} className="d-flex align-items-start">
                      <Form.Check
                        type="radio"
                        name={`question-${question.id}`}
                        id={`question-${question.id}-option-${index}`}
                        checked={index === question.correctAnswer}
                        readOnly
                        className="me-2 mt-1"
                      />
                      <div className="flex-grow-1">
                        <MathJax dynamic>
                          {renderHtmlWithMath(option)}
                        </MathJax>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </div>

              {/* Section Explication */}
              {question.explanation && (
                <div className="mt-3">
                  <h5 className="text-primary">Explication</h5>
                  <div className="ps-3">
                    <MathJax dynamic>
                      {renderHtmlWithMath(question.explanation)}
                    </MathJax>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        ))}
      </div>
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

export default QuestionsList;