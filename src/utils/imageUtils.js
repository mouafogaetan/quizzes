/**
 * Compresse une image (maxSize en KB)
 */
export const compressImage = (file, maxSize) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Calcul des nouvelles dimensions (conservation ratio)
        let width = img.width;
        let height = img.height;
        const maxDimension = 800; // Largeur/hauteur max
        
        if (width > height && width > maxDimension) {
          height *= maxDimension / width;
          width = maxDimension;
        } else if (height > maxDimension) {
          width *= maxDimension / height;
          height = maxDimension;
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        // Compression progressive
        let quality = 0.9;
        let result;
        
        const checkSize = () => {
          result = canvas.toDataURL('image/jpeg', quality);
          const sizeKB = (result.length * 0.75) / 1024; // Approximation taille en KB
          
          if (sizeKB > maxSize && quality > 0.1) {
            quality -= 0.1;
            checkSize();
          } else {
            resolve(result);
          }
        };
        
        checkSize();
      };
      
      img.onerror = error => reject(error);
    };
    
    reader.onerror = error => reject(error);
  });
};

/**
 * Extrait le texte et l'image d'un contenu HTML
 */
export const extractTextAndImages = (htmlContent) => {
  if (!htmlContent) return { text: '', image: null };
  
  // Extraction du texte (supprime les balises HTML)
  const text = htmlContent.replace(/<[^>]*>?/gm, '').trim();
  
  // Extraction de la première image
  const imgRegex = /<img[^>]+src="([^">]+)"/;
  const match = htmlContent.match(imgRegex);
  const image = match ? match[1] : null;
  
  return { text, image };
};