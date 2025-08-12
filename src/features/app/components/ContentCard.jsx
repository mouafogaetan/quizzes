import React from 'react';
import PropTypes from 'prop-types';
import defaultIcon from '../../../assets/images/default.png';

const ContentCard = ({ 
  item, 
  onEdit, 
  onDelete, 
  onClick,
  width = '200px',
  height = '150px'
}) => {
  const { id, title, icon, index, type } = item;

  // Gestion du texte à afficher selon le type
  const renderTitle = () => {
    let prefix = '';
    
    if (type === 'module' || type === 'chapitre' || type === 'lesson') {
      prefix = `${type.charAt(0).toUpperCase() + type.slice(1)} ${index || ''}`;
    }
    
    return (
      <div className="d-flex flex-column">
        {prefix && <small className="text-muted">{prefix}</small>}
        <span className="text-truncate">{title}</span>
      </div>
    );
  };


  return (
    <div 
      className={`card position-relative flex-column p-2`}
      style={{ 
        width, 
        height,
        cursor: 'pointer'
      }}
      onClick={() => onClick && onClick(item)}
    >
      {/* Boutons d'action */}
      <div className="position-absolute top-0 end-0 p-1">
        <button 
          className="btn btn-sm btn-light rounded-circle m-1"
          onClick={(e) => {
            e.stopPropagation();
            onEdit && onEdit(item);
          }}
        >
          <i className="bi bi-pencil"></i>
        </button>
        <button 
          className="btn btn-sm btn-light rounded-circle m-1"
          onClick={(e) => {
            e.stopPropagation();
            onDelete && onDelete(item);
          }}
        >
          <i className="bi bi-trash"></i>
        </button>
      </div>
      
      {/* Contenu principal */}
      <div className={`d-flex  flex-column justify-content-center h-100 w-100`}>
        <img 
          src={icon ? `data:image/png;base64,${icon}` : defaultIcon} 
          alt={title} 
          className="img-fluid mx-auto"
          style={{ maxWidth: '100px', maxHeight: '100px' }}
        />
        <div className={`mt-2 text-center`} style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical'
        }}>
          {renderTitle()}
        </div>
      </div>
    </div>
  );
};

ContentCard.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    icon: PropTypes.string,
    index: PropTypes.number,
    type: PropTypes.oneOf(['classe', 'matiere', 'module', 'chapitre', 'lesson']).isRequired
  }).isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onClick: PropTypes.func,
  width: PropTypes.string,
  height: PropTypes.string
};

export default ContentCard;