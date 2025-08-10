'use client';

import React from 'react';
import { Button } from './Button';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { useDeleteConfirmation } from '@/hooks/useDeleteConfirmation';

interface DeleteButtonProps {
  onDelete: () => Promise<void> | void;
  itemName?: string;
  itemType?: string;
  successMessage?: string;
  errorMessage?: string;
  buttonText?: string;
  buttonSize?: 'sm' | 'md' | 'lg';
  buttonVariant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  disabled?: boolean;
  confirmTitle?: string;
  confirmMessage?: string;
  showIcon?: boolean;
}

export const DeleteButton: React.FC<DeleteButtonProps> = ({
  onDelete,
  itemName,
  itemType = 'elemento',
  successMessage,
  errorMessage,
  buttonText,
  buttonSize = 'sm',
  buttonVariant = 'danger',
  disabled = false,
  confirmTitle,
  confirmMessage,
  showIcon = true,
}) => {
  const {
    isOpen,
    isLoading,
    openModal,
    closeModal,
    confirmDelete,
  } = useDeleteConfirmation({
    onDelete,
    successMessage,
    errorMessage,
    itemName,
    itemType,
  });

  const defaultButtonText = buttonText || 'Eliminar';

  return (
    <>
      <Button
        variant={buttonVariant}
        size={buttonSize}
        onClick={openModal}
        disabled={disabled}
        className="inline-flex items-center"
      >
        {showIcon && (
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        )}
        {defaultButtonText}
      </Button>

      <DeleteConfirmationModal
        isOpen={isOpen}
        onClose={closeModal}
        onConfirm={confirmDelete}
        title={confirmTitle}
        message={confirmMessage}
        itemName={itemName}
        itemType={itemType}
        isLoading={isLoading}
      />
    </>
  );
};
