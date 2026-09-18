import React from 'react';
import { MaterialType, Language } from '../../types';
import { AIMaterialScanner } from '../common/AIMaterialScanner';

interface AIScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete: (
    material: MaterialType,
    condition: 'Good' | 'Used' | 'Damaged',
    estimatedWeight?: number
  ) => void;
  language: Language;
  roleContext?: 'seller' | 'collector';
}

export const AIScannerModal: React.FC<AIScannerModalProps> = ({
  isOpen,
  onClose,
  onScanComplete,
  language,
  roleContext = 'seller',
}) => {
  if (!isOpen) return null;

  return (
    <AIMaterialScanner
      language={language}
      isModal={true}
      onClose={onClose}
      roleContext={roleContext}
      onUseResult={(material, condition, weight) => {
        onScanComplete(material, condition, weight);
      }}
    />
  );
};
