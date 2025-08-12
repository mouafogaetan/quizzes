import React, { useState, useEffect , useCallback} from 'react';
import { Card, Form, Button, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { auth, db } from "../../../firebase";
import { collection, doc, getDoc, getDocs, setDoc, query, orderBy, limit } from 'firebase/firestore';
import CustomEditor from '../components/CustomEditor';

const DashboardPage = () => {
  // États pour les sélections
  const [classes, setClasses] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [modules, setModules] = useState([]);
  const [chapitres, setChapitres] = useState([]);
  const [lecons, setLecons] = useState([]);
  
  // États pour les sélections courantes
  const [selectedClasse, setSelectedClasse] = useState('');
  const [selectedMatiere, setSelectedMatiere] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [selectedChapitre, setSelectedChapitre] = useState('');
  const [selectedLecon, setSelectedLecon] = useState('');
  
  // États pour la question
  const [enonce, setEnonce] = useState({ content: '', images: [] });
  const [explications, setExplications] = useState({ content: '', images: [] });
  const [choix, setChoix] = useState([
    { content: '', images: [] },
    { content: '', images: [] }
  ]);
  const [reponse, setReponse] = useState(0);
  const [niveau, setNiveau] = useState(1);
  
  // États pour le chargement et les erreurs
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Charger les classes au montage
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        setError(null);
        const classesCollection = collection(db, 'classes');
        const snapshot = await getDocs(classesCollection);
        const classesList = snapshot.docs.map(doc => ({
          id: doc.id,
          nom: doc.data().nom
        }));
        setClasses(classesList);
      } catch (err) {
        setError("Erreur lors du chargement des classes. Veuillez réessayer.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  // Charger les matières quand une classe est sélectionnée
  useEffect(() => {
    const fetchMatieres = async () => {
      if (!selectedClasse) return;
      
      try {
        setLoading(true);
        setError(null);
        setSelectedMatiere('');
        setMatieres([]);
        
        const matieresCollection = collection(db, `classes/${selectedClasse}/matieres`);
        const snapshot = await getDocs(matieresCollection);
        const matieresList = snapshot.docs.map(doc => ({
          id: doc.id,
          nom: doc.data().nom
        }));
        setMatieres(matieresList);
      } catch (err) {
        setError("Erreur lors du chargement des matières. Veuillez réessayer.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatieres();
  }, [selectedClasse]);

  // Charger les modules quand une matière est sélectionnée
  useEffect(() => {
    const fetchModules = async () => {
      if (!selectedClasse || !selectedMatiere) return;
      
      try {
        setLoading(true);
        setError(null);
        setSelectedModule('');
        setModules([]);
        
        const modulesCollection = collection(db, `classes/${selectedClasse}/matieres/${selectedMatiere}/modules`);
        const snapshot = await getDocs(modulesCollection);
        const modulesList = snapshot.docs.map(doc => ({
          id: doc.id,
          intitule: doc.data().intitule
        }));
        setModules(modulesList);
      } catch (err) {
        setError("Erreur lors du chargement des modules. Veuillez réessayer.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [selectedClasse, selectedMatiere]);

  // Charger les chapitres quand un module est sélectionné
  useEffect(() => {
    const fetchChapitres = async () => {
      if (!selectedClasse || !selectedMatiere || !selectedModule) return;
      
      try {
        setLoading(true);
        setError(null);
        setSelectedChapitre('');
        setChapitres([]);
        
        const chapitresCollection = collection(db, `classes/${selectedClasse}/matieres/${selectedMatiere}/modules/${selectedModule}/chapitres`);
        const snapshot = await getDocs(chapitresCollection);
        const chapitresList = snapshot.docs.map(doc => ({
          id: doc.id,
          intitule: doc.data().intitule
        }));
        setChapitres(chapitresList);
      } catch (err) {
        setError("Erreur lors du chargement des chapitres. Veuillez réessayer.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchChapitres();
  }, [selectedClasse, selectedMatiere, selectedModule]);

  // Charger les leçons quand un chapitre est sélectionné
  useEffect(() => {
    const fetchLecons = async () => {
      if (!selectedClasse || !selectedMatiere || !selectedModule || !selectedChapitre) return;
      
      try {
        setLoading(true);
        setError(null);
        setSelectedLecon('');
        setLecons([]);
        
        const leconsCollection = collection(db, `classes/${selectedClasse}/matieres/${selectedMatiere}/modules/${selectedModule}/chapitres/${selectedChapitre}/lecons`);
        const snapshot = await getDocs(leconsCollection);
        const leconsList = snapshot.docs.map(doc => ({
          id: doc.id,
          intitule: doc.data().intitule
        }));
        setLecons(leconsList);
      } catch (err) {
        setError("Erreur lors du chargement des leçons. Veuillez réessayer.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLecons();
  }, [selectedClasse, selectedMatiere, selectedModule, selectedChapitre]);

  // Ajouter un choix
  const addChoix = () => {
    setChoix([...choix, '']);
  };

  // Supprimer un choix
  const removeChoix = (index) => {
    if (choix.length <= 2) return;
    const newChoix = choix.filter((_, i) => i !== index);
    setChoix(newChoix);
    if (reponse >= index) {
      setReponse(Math.max(0, reponse - 1));
    }
  };

  // Mettre à jour un choix
  const updateChoix = useCallback((index, value) => {
    setChoix(prevChoix => {
      // Éviter les mises à jour inutiles
      if (JSON.stringify(prevChoix[index]) === JSON.stringify(value)) {
        return prevChoix;
      }
      
      const newChoix = [...prevChoix];
      newChoix[index] = value;
      return newChoix;
    });
  }, []);

  // Soumettre la question
  const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!selectedClasse || !selectedMatiere || !selectedModule || !selectedChapitre || !selectedLecon) {
    setError("Veuillez sélectionner tous les niveaux hiérarchiques.");
    return;
  }
  if (!enonce || choix.some(c => !c)) {
    setError("Veuillez remplir tous les champs obligatoires.");
    return;
  }
  
  try {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    // Fonction pour transformer un objet éditeur en HTML
    const transformEditorToHTML = (editorValue) => {
      let html = '<div>';
      
      // Partie texte
      html += '<div>';
      if (editorValue.content) {
        editorValue.content.split('\n').forEach((line, index) => {
          html += `<div key="${index}">${line}</div>`;
        });
      }
      html += '</div>';
      
      // Partie images
      if (editorValue.images && editorValue.images.length > 0) {
        html += `<div style="margin-top: 20px; padding-top: 10px; border-top: 1px dashed #ccc;">`;
        editorValue.images.forEach((img, index) => {
          html += `<img 
            key="img-${index}"
            src="${img}"
            alt="content-${index}"
            style="max-width: 200px; max-height: 200px; margin: 5px; display: inline-block;"
          />`;
        });
        html += '</div>';
      }
      
      html += '</div>';
      return html;
    };
    
    // Transformer les contenus en HTML
    const enonceHTML = transformEditorToHTML(enonce);
    const choixHTML = choix.map(choice => transformEditorToHTML(choice));
    const explicationsHTML = explications ? transformEditorToHTML(explications) : '';
    
    const questionsRef = collection(db, 
      `classes/${selectedClasse}/matieres/${selectedMatiere}/modules/${selectedModule}/chapitres/${selectedChapitre}/lecons/${selectedLecon}/questions`);
    
    // OPTION 1: Utiliser un champ timestamp pour le tri
    const q = query(questionsRef, orderBy('createdAt', 'desc'), limit(1));
    const snapshot = await getDocs(q);
    
    let newId = "1";
    if (!snapshot.empty) {
      const lastId = snapshot.docs[0].id;
      newId = (parseInt(lastId) + 1).toString();
    }
    
    const newQuestionRef = doc(questionsRef, newId);

    await setDoc(newQuestionRef, {
      questionText: enonceHTML,
      options: choixHTML,
      correctAnswer: reponse,
      explanation: explicationsHTML,
      difficuty: niveau == 1 ? "easy" : niveau == 2 ? "medium" : niveau == 3 ? "hard" : "very hard",
      createdAt: new Date() // Ajouter ce champ pour les futures requêtes
    });
    
    setSuccess(true);
    // Réinitialiser les champs de la question (mais pas les sélections)
    setEnonce({ content: '', images: [] });
    setChoix([
      { content: '', images: [] },
      { content: '', images: [] }
    ]);
    setReponse(0);
    setExplications({ content: '', images: [] });
    setNiveau(1);
  } catch (err) {
    setError("Erreur lors de l'enregistrement de la question. Veuillez réessayer.");
    console.error(err);
  } finally {
    setLoading(false);
  }
};
  return (
    <Card>
      <Card.Body>
        <h1>Créer une nouvelle question</h1>
        
        {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
        {success && <Alert variant="success" onClose={() => setSuccess(false)} dismissible>
          Question enregistrée avec succès!
        </Alert>}
        
        <Form onSubmit={handleSubmit}>
          {/* Sélection hiérarchique */}
          <Row className="mb-3">
            <Col md={2}>
              <Form.Group>
                <Form.Label><h3>Classe</h3></Form.Label>
                <Form.Select 
                  value={selectedClasse} 
                  onChange={(e) => setSelectedClasse(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Sélectionner une classe</option>
                  {classes.map(classe => (
                    <option key={classe.id} value={classe.id}>{classe.nom}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={2}>
              <Form.Group>
                <Form.Label><h3>Matière</h3></Form.Label>
                <Form.Select 
                  value={selectedMatiere} 
                  onChange={(e) => setSelectedMatiere(e.target.value)}
                  disabled={!selectedClasse || loading}
                >
                  <option value="">Sélectionner une matière</option>
                  {matieres.map(matiere => (
                    <option key={matiere.id} value={matiere.id}>{matiere.nom}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={2}>
              <Form.Group>
                <Form.Label><h3>Module</h3></Form.Label>
                <Form.Select 
                  value={selectedModule} 
                  onChange={(e) => setSelectedModule(e.target.value)}
                  disabled={!selectedMatiere || loading}
                >
                  <option value="">Sélectionner un module</option>
                  {modules.map(module => (
                    <option key={module.id} value={module.id}>{module.intitule}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={2}>
              <Form.Group>
                <Form.Label><h3>Chapitre</h3></Form.Label>
                <Form.Select 
                  value={selectedChapitre} 
                  onChange={(e) => setSelectedChapitre(e.target.value)}
                  disabled={!selectedModule || loading}
                >
                  <option value="">Sélectionner un chapitre</option>
                  {chapitres.map(chapitre => (
                    <option key={chapitre.id} value={chapitre.id}>{chapitre.intitule}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={2}>
              <Form.Group>
                <Form.Label><h3>Leçon</h3></Form.Label>
                <Form.Select 
                  value={selectedLecon} 
                  onChange={(e) => setSelectedLecon(e.target.value)}
                  disabled={!selectedChapitre || loading}
                >
                  <option value="">Sélectionner une leçon</option>
                  {lecons.map(lecon => (
                    <option key={lecon.id} value={lecon.id}>{lecon.intitule}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={2}>
              <Form.Group>
                <Form.Label><h3>Niveau</h3></Form.Label>
                <Form.Select 
                  value={niveau} 
                  onChange={(e) => setNiveau(parseInt(e.target.value))}
                >
                  <option value={1}>Facile</option>
                  <option value={2}>Moyen</option>
                  <option value={3}>Difficile</option>
                  <option value={4}>Expert</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          
          {loading && <div className="text-center my-3"><Spinner animation="border" /></div>}
          
          {/* Éditeur pour l'énoncé */}
          <Form.Group className="mb-3">
            <Form.Label><h2>Énoncé de la question</h2></Form.Label>
            <CustomEditor 
              value={enonce}
              onChange={setEnonce}
            />  
          </Form.Group>
          
          {/* Choix de réponse */}
          <Form.Group className="mb-3">
            <Form.Label><h2>Choix de réponse</h2></Form.Label>
            {choix.map((option, index) => (
              <div key={index} className="mb-2 d-flex align-items-center">
                <CustomEditor
                  value={option}
                  onChange={(content) => updateChoix(index, content)}
                  height={150}
                  key={`editor-${index}`}
                />
                {choix.length > 2 && (
                  <Button 
                    variant="danger" 
                    size="sm" 
                    className="ms-2" 
                    onClick={() => removeChoix(index)}
                    disabled={loading}
                  >
                    ×
                  </Button>
                )}
              </div>
            ))}
            <Button 
              variant="primary" 
              size="sm" 
              onClick={addChoix}
              disabled={loading}
            >
              Ajouter un choix +
            </Button>
          </Form.Group>
          
          {/* Bonne réponse */}
          <Form.Group className="mb-3">
            <Form.Label><h2>Bonne réponse</h2></Form.Label>
            <Form.Select 
              value={reponse} 
              onChange={(e) => setReponse(parseInt(e.target.value))}
              disabled={loading}
            >
              {choix.map((_, index) => (
                <option key={index} value={index}>Choix {index + 1}</option>
              ))}
            </Form.Select>
          </Form.Group>
          
          {/* Explications */}
          <Form.Group className="mb-3">
            <Form.Label><h2>Explications</h2></Form.Label>
            <CustomEditor 
              value={explications}
              onChange={setExplications}
            />
          </Form.Group>
          
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Enregistrement...' : 'Enregistrer la question'}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default DashboardPage;