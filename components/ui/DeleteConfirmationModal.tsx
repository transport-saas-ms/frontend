'use client';

import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  itemName?: string;
  itemType?: string;
  isLoading?: boolean;
  danger?: boolean;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  itemType = 'elemento',
  isLoading = false,
  danger = true,
}) => {
  const defaultTitle = title || `Eliminar ${itemType}`;
  const defaultMessage = message || 
    `¿Estás seguro de que deseas eliminar ${itemName ? `"${itemName}"` : `este ${itemType}`}? Esta acción no se puede deshacer.`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center mb-4">
          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
            danger ? 'bg-red-100' : 'bg-yellow-100'
          }`}>
            <svg
              className={`w-6 h-6 ${danger ? 'text-red-600' : 'text-yellow-600'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">
              {defaultTitle}
            </h3>
          </div>
        </div>

        {/* Content */}
        <div className="mb-6">
          <p className="text-sm text-gray-500">
            {defaultMessage}
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            variant={danger ? "danger" : "primary"}
            onClick={onConfirm}
            loading={isLoading}
          >
            {danger ? 'Eliminar' : 'Confirmar'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
