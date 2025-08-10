import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

interface UseDeleteConfirmationOptions {
  onDelete: () => Promise<void> | void;
  successMessage?: string;
  errorMessage?: string;
  itemName?: string;
  itemType?: string;
}

export const useDeleteConfirmation = ({
  onDelete,
  successMessage,
  errorMessage,
  itemName,
  itemType = 'elemento',
}: UseDeleteConfirmationOptions) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const openModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    if (!isLoading) {
      setIsOpen(false);
    }
  }, [isLoading]);

  const confirmDelete = useCallback(async () => {
    try {
      setIsLoading(true);
      await onDelete();
      
      setIsOpen(false);
      
      // Mensaje de éxito
      const defaultSuccessMessage = successMessage || 
        `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} ${itemName ? `"${itemName}"` : ''} eliminado correctamente`;
      toast.success(defaultSuccessMessage);
      
    } catch (error) {
      console.error('Error al eliminar:', error);
      
      // Mensaje de error
      const defaultErrorMessage = errorMessage || 
        `Error al eliminar ${itemType}. Intenta de nuevo.`;
      toast.error(defaultErrorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [onDelete, successMessage, errorMessage, itemName, itemType]);

  return {
    isOpen,
    isLoading,
    openModal,
    closeModal,
    confirmDelete,
  };
};
