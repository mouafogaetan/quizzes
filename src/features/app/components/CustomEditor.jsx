import React, { useState, useRef, useEffect } from 'react';
import 'mathjax/es5/tex-mml-chtml';

const CustomEditor = React.memo(({ value, onChange, height = 300 }) => {
  // Structure de la valeur :
  // {
  //   content: "texte avec formules latex $x^2$",
  //   images: ["base64img1", "base64img2"]
  // }
  const [editorValue, setEditorValue] = useState(value || { content: '', images: [] });
  const [mathExpression, setMathExpression] = useState('');
  const [showMathDialog, setShowMathDialog] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const previewRef = useRef(null);

  // Synchronise la valeur externe seulement si elle change vraiment
  useEffect(() => {
    if (value && JSON.stringify(value) !== JSON.stringify(editorValue)) {
      setEditorValue(value);
    }
  }, [value]);

  // Typeset MathJax quand le contenu change
  useEffect(() => {
    if (window.MathJax && previewRef.current) {
      window.MathJax.typesetPromise([previewRef.current]).catch(err => {
        console.error('MathJax typeset error:', err);
      });
    }
  }, [editorValue.content]);

  const handleImageUpload = async (e) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const files = Array.from(e.target.files);
    const newImages = [];

    for (const file of files) {
      if (!file.type.match('image.*')) continue;

      try {
        const base64 = await convertToBase64(file);
        newImages.push(base64);
      } catch (error) {
        console.error("Erreur de conversion:", error);
      }
    }

    if (newImages.length > 0) {
      const newValue = {
        ...editorValue,
        images: [...editorValue.images, ...newImages]
      };
      setEditorValue(newValue);
      onChange(newValue);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const removeImage = (index) => {
    const newImages = [...editorValue.images];
    newImages.splice(index, 1);
    const newValue = { ...editorValue, images: newImages };
    setEditorValue(newValue);
    onChange(newValue);
  };

  const insertAtCursor = (text) => {
    const textarea = textareaRef.current;
    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    
    const newContent = 
      editorValue.content.substring(0, startPos) + 
      text + 
      editorValue.content.substring(endPos);
    
    const newValue = { ...editorValue, content: newContent };
    setEditorValue(newValue);
    onChange(newValue);
    
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = startPos + text.length;
      textarea.selectionEnd = startPos + text.length;
    }, 0);
  };

  const handleAddMathExpression = () => {
    if (!mathExpression.trim()) return;
    
    const mathText = `$${mathExpression}$`;
    insertAtCursor(mathText);
    setMathExpression('');
    setShowMathDialog(false);
  };

  const handleContentChange = (e) => {
    const newValue = { ...editorValue, content: e.target.value };
    setEditorValue(newValue);
    onChange(newValue);
  };

  return (
    <div style={{ display: 'flex', gap: '20px', width: '100%' }}>
      {/* Partie Edition */}
      <div style={{ flex: 1 }}>
        <div style={{ marginBottom: '10px', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button 
            onClick={() => fileInputRef.current.click()}
            style={{ padding: '6px 12px', cursor: 'pointer' }}
            type="button"
          >
            Image
          </button>
          
          <button 
            onClick={() => setShowMathDialog(true)}
            style={{ padding: '6px 12px', cursor: 'pointer' }}
            type="button"
          >
            Formule
          </button>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            multiple
            style={{ display: 'none' }}
          />
        </div>

        {/* Miniatures des images */}
        {editorValue.images.length > 0 && (
          <div style={{ 
            display: 'flex', 
            gap: '10px', 
            flexWrap: 'wrap',
            marginBottom: '10px',
            padding: '10px',
            border: '1px dashed #ccc',
            borderRadius: '4px'
          }}>
            {editorValue.images.map((img, index) => (
              <div key={index} style={{ position: 'relative' }}>
                <img 
                  src={img} 
                  alt={`preview-${index}`}
                  style={{ 
                    width: '50px', 
                    height: '50px',
                    objectFit: 'cover',
                    borderRadius: '4px'
                  }}
                />
                <button
                  onClick={() => removeImage(index)}
                  style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    background: '#ff4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '12px',
                    padding: 0
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Zone de texte */}
        <textarea
          ref={textareaRef}
          value={editorValue.content}
          onChange={handleContentChange}
          style={{
            width: '100%',
            height: `${height}px`,
            padding: '10px',
            border: '1px solid #ced4da',
            borderRadius: '4px',
            fontFamily: 'Arial, sans-serif',
            fontSize: '16px'
          }}
        />
        
        {/* Boîte de dialogue pour les formules mathématiques */}
        {showMathDialog && (
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            zIndex: 1000,
            width: '400px'
          }}>
            <h5>Entrez votre expression mathématique</h5>
            <p>Utilisez la syntaxe LaTeX</p>
            
            <textarea
              value={mathExpression}
              onChange={(e) => setMathExpression(e.target.value)}
              style={{
                width: '100%',
                minHeight: '100px',
                margin: '10px 0',
                padding: '8px',
                border: '1px solid #ced4da',
                borderRadius: '4px'
              }}
            />
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                onClick={() => setShowMathDialog(false)}
                style={{ padding: '6px 12px', backgroundColor: '#f8f9fa', border: '1px solid #ced4da' }}
                type="button"
              >
                Annuler
              </button>
              <button 
                onClick={handleAddMathExpression}
                style={{ padding: '6px 12px', backgroundColor: '#007bff', color: 'white', border: 'none' }}
                type="button"
              >
                Insérer
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Partie Prévisualisation */}
      <div style={{ flex: 1, border: '1px solid #eee', padding: '15px', borderRadius: '4px' }}>
        <h4 style={{ marginTop: 0 }}>Prévisualisation</h4>
        <div
          ref={previewRef}
          style={{ 
            minHeight: `${height}px`,
            border: '1px solid #ddd',
            padding: '10px',
            borderRadius: '4px'
          }}
        >
          {/* Contenu texte avec formules */}
          <div>
            {editorValue.content.split('\n').map((line, index) => (
              <div key={index}>{line}</div>
            ))}
          </div>
          
          {/* Images en bas */}
          {editorValue.images.length > 0 && (
            <div style={{ 
              marginTop: '20px',
              paddingTop: '10px',
              borderTop: '1px dashed #ccc'
            }}>
              {editorValue.images.map((img, index) => (
                <img 
                  key={index}
                  src={img}
                  alt={`content-${index}`}
                  style={{
                    maxWidth: '200px',
                    maxHeight: '200px',
                    margin: '5px',
                    display: 'inline-block'
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

// Fonction de comparaison personnalisée pour React.memo
const areEqual = (prevProps, nextProps) => {
  return JSON.stringify(prevProps.value) === JSON.stringify(nextProps.value) &&
         prevProps.height === nextProps.height;
};

export default React.memo(CustomEditor, areEqual);