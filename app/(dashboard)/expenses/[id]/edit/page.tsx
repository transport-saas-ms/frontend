"use client";

import React from 'react';
import { ExpenseForm } from '@/components/expenses/ExpenseForm';
import { useParams } from 'next/navigation';

export default function EditExpensePage() {
  const params = useParams();
  const expenseId = params.id as string;

  return (
    <div className="max-w-3xl mx-auto">
      <ExpenseForm mode="edit" expenseId={expenseId} onSuccessRedirect="/expenses" />
    </div>
  );
}
