import React from "react";
import { COMMON_INPUT_CLASSES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface FormFieldProps {
    label: string;
    name: string;
    type?: "text" | "number" | "email" | "password" | "checkbox";
    value?: string | number;
    defaultValue?: string | number;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    min?: string | number;
    max?: string | number;
    step?: string | number;
    className?: string;
    children?: React.ReactNode;
    onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export function FormField({
    label,
    name,
    type = "text",
    value,
    defaultValue,
    placeholder,
    required = false,
    disabled = false,
    min,
    max,
    step,
    className,
    children,
    onChange,
}: FormFieldProps) {
    if (type === "checkbox") {
        return (
            <div className={cn("col-span-full", className)}>
                <label className="flex items-center text-gray-900 dark:text-white">
                    <input
                        name={name}
                        type="checkbox"
                        className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        onChange={onChange}
                    />
                    <span className="font-medium">{label}</span>
                </label>
            </div>
        );
    }

    // Use controlled or uncontrolled input pattern
    const inputProps: React.InputHTMLAttributes<HTMLInputElement> = {
        name,
        type,
        placeholder,
        required,
        disabled,
        min,
        max,
        step,
        className: COMMON_INPUT_CLASSES,
        onChange,
    };

    // If value is provided, use controlled input
    if (value !== undefined) {
        inputProps.value = value;
    } else if (defaultValue !== undefined) {
        // If only defaultValue is provided, use uncontrolled input
        inputProps.defaultValue = defaultValue;
    }

    return (
        <div className={className}>
            <label className="block text-gray-900 dark:text-white">
                <span className="block mb-2 font-medium">{label}</span>
                {children ? (
                    children
                ) : (
                    <input {...inputProps} />
                )}
            </label>
        </div>
    );
}

interface SelectFieldProps extends Omit<FormFieldProps, "type" | "children"> {
    options: Array<{ value: string | number; label: string }>;
    emptyLabel?: string;
}

export function SelectField({
    label,
    name,
    value,
    required = false,
    disabled = false,
    className,
    options,
    emptyLabel = "Select an option",
    onChange,
}: SelectFieldProps) {
    return (
        <div className={className}>
            <label className="block text-gray-900 dark:text-white">
                <span className="block mb-2 font-medium">{label}</span>
                <select
                    name={name}
                    value={value}
                    required={required}
                    disabled={disabled}
                    className={COMMON_INPUT_CLASSES}
                    onChange={onChange}
                >
                    <option value="">{emptyLabel}</option>
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </label>
        </div>
    );
}
