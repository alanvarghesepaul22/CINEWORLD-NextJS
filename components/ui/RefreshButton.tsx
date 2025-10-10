"use client";
import React from "react";
import { Button } from "./button";

interface RefreshButtonProps {
  children: React.ReactNode;
  className?: string;
}

const RefreshButton = ({ children, className = "" }: RefreshButtonProps) => {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <Button onClick={handleRefresh} className={className}>
      {children}
    </Button>
  );
};
export default RefreshButton;
