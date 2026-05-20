import type { ResultPhoto } from '../services/resultService';

interface ResultPhotoLightboxProps {
    photo: ResultPhoto | null;
    onClose: () => void;
}

export const ResultPhotoLightbox = ({ photo, onClose }: ResultPhotoLightboxProps) => {
    if (!photo) {
        return null;
    }

    return (
        <div className="result-lightbox" role="dialog" aria-modal="true" aria-label="Previzualizare poza marita" onClick={onClose}>
            <div className="result-lightbox-content" onClick={(event) => event.stopPropagation()}>
                <button type="button" onClick={onClose} className="result-lightbox-close" aria-label="Inchide poza marita">
                    X
                </button>
                <img src={photo.dataUrl} alt={photo.name} className="result-lightbox-image" />
                <p className="mt-3 text-sm font-semibold text-white">{photo.name}</p>
            </div>
        </div>
    );
};
