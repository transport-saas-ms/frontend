import React from 'react';
import { ExpenseForm } from '@/components/expenses/ExpenseForm';

export default function NewExpensePage() {
  return (
    <div className="max-w-3xl mx-auto">
      <ExpenseForm mode="create" />
    </div>
  );
}
