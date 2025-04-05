import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { type ButtonProps } from "@/components/ui/button";

interface LoadingButtonProps extends ButtonProps {
    isLoading?: boolean;
    loadingText?: string;
    children: React.ReactNode;
    spinnerClassName?: string;
}

export const LoadingButton = ({
    isLoading = false,
    loadingText = "Loading",
    children,
    spinnerClassName = "mr-2 h-4 w-4",
    disabled,
    ...props
}: LoadingButtonProps) => {
    return (
        <Button
            disabled={isLoading || disabled}
            {...props}
        >
            {isLoading ? (
                <>
                    <Loader2 className={`animate-spin ${spinnerClassName}`} />
                    {loadingText}
                </>
            ) : (
                children
            )}
        </Button>
    );
};