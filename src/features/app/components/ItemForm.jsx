import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const ItemForm = ({ 
  itemToEdit = null, 
  itemType, 
  onSubmit, 
  onCancel 
}) => {
  const [id, setId] = useState('');
  const [title, setTitle] = useState('');
  const [index, setIndex] = useState('');
  const [icon, setIcon] = useState(null);
  const [iconPreview, setIconPreview] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (itemToEdit) {
      setTitle(itemToEdit.title);
      setIndex(itemToEdit.index || '');
      setIconPreview(itemToEdit.icon ? `data:image/png;base64,${itemToEdit.icon}` : '');
    } else {
      // Réinitialiser les champs en mode ajout
      setId('');
      setTitle('');
      setIndex('');
      setIcon(null);
      setIconPreview('');
    }
  }, [itemToEdit, itemType]);

  // Fonction pour compresser l'image
  const compressImage = async (file, maxSizeKB = 500) => {
    return new Promise((resolve) => {
      if (file.size / 1024 <= maxSizeKB) {
        resolve(file);
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          let width = img.width;
          let height = img.height;
          let quality = 0.9;
          let compressedFile;

          do {
            canvas.width = width;
            canvas.height = height;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, width, height);

            const dataUrl = canvas.toDataURL('image/jpeg', quality);
            compressedFile = dataURLtoFile(dataUrl, file.name);
            
            width *= 0.9;
            height *= 0.9;
            quality *= 0.9;
          } while (compressedFile.size / 1024 > maxSizeKB && quality > 0.2);

          resolve(compressedFile);
        };
      };
    });
  };

  const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new File([u8arr], filename, { type: mime });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    
    try {
      if (!file.type.match('image.*')) {
        throw new Error('Veuillez sélectionner une image valide');
      }

      const processedFile = await compressImage(file);
      setIcon(processedFile);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setIconPreview(reader.result);
        setIsProcessing(false);
      };
      reader.readAsDataURL(processedFile);
    } catch (error) {
      console.error('Erreur de traitement de l\'image:', error);
      alert(error.message);
      setIsProcessing(false);
      handleRemoveImage();
    }
  };

  const handleRemoveImage = () => {
    setIcon(null);
    setIconPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = () => {
    const errors = {};
    const trimmedId = id.trim();
    
    // Validation du titre
    if (!title.trim()) {
      errors.title = 'Ce champ est obligatoire';
    }
    
    // Validation de l'index pour module/chapitre/lesson
    if ((itemType === 'module' || itemType === 'chapitre' || itemType === 'lesson') && !index) {
      errors.index = 'Ce champ est obligatoire';
    }
    
    // Validation de l'ID en mode ajout pour classe/matière
    if (!itemToEdit && (itemType === 'classe' || itemType === 'matiere')) {
      if (!trimmedId) {
        errors.id = 'Ce champ est obligatoire';
      } else if (trimmedId.length < 2) {
        errors.id = 'Doit contenir au moins 2 caractères';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (isProcessing) return;

    setIsProcessing(true);
    
    try {
      let iconBase64 = null;
      
      if (icon) {
        iconBase64 = await fileToBase64(icon);
      } else if (itemToEdit?.icon && !iconPreview) {
        iconBase64 = null;
      } else if (itemToEdit?.icon) {
        iconBase64 = itemToEdit.icon;
      }

      // Déterminer l'ID final
      let finalId = itemToEdit?.id;
      if (!itemToEdit) {
        finalId = (itemType === 'module' || itemType === 'chapitre' || itemType === 'lesson')
          ? `${itemType}-${index}` // ID généré automatiquement
          : id.trim(); // ID saisi pour classe/matière
      }

      onSubmit({
        id: finalId,
        title,
        index: itemType !== 'classe' && itemType !== 'matiere' ? index : undefined,
        type: itemType,
        icon: iconBase64
      });
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const getFormTitle = () => {
    return `${itemToEdit ? 'Modifier' : 'Ajouter'} ${getTypeLabel()}`;
  };

  const getTypeLabel = () => {
    switch(itemType) {
      case 'classe': return 'une classe';
      case 'matiere': return 'une matière';
      case 'module': return 'un module';
      case 'chapitre': return 'un chapitre';
      case 'lesson': return 'une lesson';
      default: return '';
    }
  };

  return (
    <div className="card">
      <div className="card-header bg-primary text-white">
        <h5 className="mb-0">{getFormTitle()}</h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          {/* Champ ID - seulement en mode ajout pour classe/matière */}
          {!itemToEdit && (itemType === 'classe' || itemType === 'matiere') && (
            <div className="mb-3">
              <label htmlFor="id" className="form-label">
                Identifiant {validationErrors.id && <span className="text-danger">*</span>}
              </label>
              <input
                type="text"
                className={`form-control ${validationErrors.id ? 'is-invalid' : ''}`}
                id="id"
                value={id}
                onChange={(e) => setId(e.target.value)}
                disabled={isProcessing}
                placeholder="Entrez un identifiant unique"
              />
              {validationErrors.id && (
                <div className="invalid-feedback">{validationErrors.id}</div>
              )}
              <small className="text-muted">Doit contenir au moins 2 caractères (hors espaces)</small>
            </div>
          )}

          {/* Champ Titre */}
          <div className="mb-3">
            <label htmlFor="title" className="form-label">
              Titre {validationErrors.title && <span className="text-danger">*</span>}
            </label>
            <input
              type="text"
              className={`form-control ${validationErrors.title ? 'is-invalid' : ''}`}
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isProcessing}
            />
            {validationErrors.title && (
              <div className="invalid-feedback">{validationErrors.title}</div>
            )}
          </div>

          {/* Champ Index */}
          {(itemType === 'module' || itemType === 'chapitre' || itemType === 'lesson') && (
            <div className="mb-3">
              <label htmlFor="index" className="form-label">
                Numéro {validationErrors.index && <span className="text-danger">*</span>}
              </label>
              <input
                type="number"
                className={`form-control ${validationErrors.index ? 'is-invalid' : ''}`}
                id="index"
                value={index}
                onChange={(e) => setIndex(e.target.value)}
                min="1"
                disabled={isProcessing}
              />
              {validationErrors.index && (
                <div className="invalid-feedback">{validationErrors.index}</div>
              )}
              <small className="text-muted">L'ID sera généré automatiquement sous la forme: {itemType}-[numéro]</small>
            </div>
          )}

          {/* Champ Image */}
          <div className="mb-3">
            <label className="form-label">Icône (max 500KB)</label>
            <div className="d-flex align-items-center">
              {iconPreview ? (
                <div className="position-relative me-3">
                  <img 
                    src={iconPreview} 
                    alt="Preview" 
                    className="img-thumbnail" 
                    style={{ width: '50px', height: '50px', objectFit: 'contain' }}
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-danger position-absolute top-0 end-0 translate-middle"
                    onClick={handleRemoveImage}
                    style={{ padding: '0.15rem 0.3rem' }}
                    disabled={isProcessing}
                  >
                    <i className="bi bi-x"></i>
                  </button>
                </div>
              ) : null}
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={handleImageChange}
                ref={fileInputRef}
                style={{ maxWidth: '250px' }}
                disabled={isProcessing}
              />
            </div>
            {isProcessing && (
              <div className="mt-2 text-muted">
                <small>Traitement de l'image en cours...</small>
              </div>
            )}
          </div>

          {/* Boutons */}
          <div className="d-flex justify-content-end gap-2">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onCancel}
              disabled={isProcessing}
            >
              Annuler
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                  {itemToEdit ? 'Modification...' : 'Ajout...'}
                </>
              ) : (
                itemToEdit ? 'Modifier' : 'Ajouter'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

ItemForm.propTypes = {
  itemToEdit: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    icon: PropTypes.string,
    index: PropTypes.number,
    type: PropTypes.oneOf(['classe', 'matiere', 'module', 'chapitre', 'lesson'])
  }),
  itemType: PropTypes.oneOf(['classe', 'matiere', 'module', 'chapitre', 'lesson']).isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};

export default ItemForm;