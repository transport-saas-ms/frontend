'use client';

import React from 'react';
import { useDeleteExpense } from '@/hooks/useExpenses';
import { DeleteButton } from '@/components/ui/DeleteButton';
import { Expense } from '@/lib/types';

interface DeleteExpenseButtonProps {
  expense: Expense;
  buttonSize?: 'sm' | 'md' | 'lg';
  buttonVariant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  buttonText?: string;
  showIcon?: boolean;
  onDeleted?: () => void; // Callback opcional después de eliminar
}

export const DeleteExpenseButton: React.FC<DeleteExpenseButtonProps> = ({
  expense,
  buttonSize = 'sm',
  buttonVariant = 'danger',
  buttonText = 'Eliminar',
  showIcon = true,
  onDeleted,
}) => {
  const deleteExpenseMutation = useDeleteExpense();

  const handleDelete = async () => {
    await deleteExpenseMutation.mutateAsync(expense.id);
    onDeleted?.();
  };

  return (
    <DeleteButton
      onDelete={handleDelete}
      itemName={expense.description || `Gasto de $${expense.amount}`}
      itemType="gasto"
      buttonText={buttonText}
      buttonSize={buttonSize}
      buttonVariant={buttonVariant}
      showIcon={showIcon}
      successMessage={`Gasto eliminado correctamente`}
      errorMessage="Error al eliminar el gasto. Intenta de nuevo."
      confirmTitle="Eliminar gasto"
      confirmMessage={`¿Estás seguro de que deseas eliminar este gasto${expense.description ? ` "${expense.description}"` : ` de $${expense.amount}`}? Esta acción no se puede deshacer.`}
    />
  );
};
