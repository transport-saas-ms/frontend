"use client";

import React from "react";
import { useDeleteUser } from "@/hooks/useUsers";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { User } from "@/lib/types/index";

interface DeleteUserButtonProps {
  user: User;
  buttonSize?: "sm" | "md" | "lg";
  buttonVariant?: "primary" | "secondary" | "danger" | "ghost";
  buttonText?: string;
  showIcon?: boolean;
  onDeleted?: () => void; // Callback opcional después de eliminar
  disabled?: boolean;
}

export const DeleteUserButton: React.FC<DeleteUserButtonProps> = ({
  user,
  buttonSize = "sm",
  buttonVariant = "danger",
  buttonText = "Eliminar",
  showIcon = true,
  onDeleted,
  disabled = false,
}) => {
  const deleteUserMutation = useDeleteUser();

  const handleDelete = async () => {
    await deleteUserMutation.mutateAsync(user.id);
    onDeleted?.();
  };

  return (
    <DeleteButton
      onDelete={handleDelete}
      itemName={user.name}
      itemType="usuario"
      buttonText={buttonText}
      buttonSize={buttonSize}
      buttonVariant={buttonVariant}
      showIcon={showIcon}
      disabled={disabled || deleteUserMutation.isPending}
      successMessage={`Usuario "${user.name}" eliminado correctamente`}
      errorMessage="Error al eliminar el usuario. Intenta de nuevo."
      confirmTitle="Eliminar usuario"
      confirmMessage={`¿Estás seguro de que deseas eliminar al usuario "${
        user.name
      }" (${user.email})? 
Esta acción eliminará el acceso del usuario al sistema y no se puede deshacer fácilmente.
Rol actual: ${
        user.role === "ADMIN"
          ? "Administrador"
          : user.role === "ACCOUNTANT"
          ? "Contador"
          : user.role === "DRIVER"
          ? "Conductor"
          : "Usuario"
      }`}
    />
  );
};
