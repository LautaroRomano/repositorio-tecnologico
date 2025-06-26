"use client";

import React, { useState, useEffect } from "react";
import Select from "react-select";
import axios from "axios";
import { Badge } from "./badge";
import { FaTimes } from "react-icons/fa";
import { Tag } from "@/types/types";

interface TagOption {
  value: number;
  label: string;
}

interface TagMultiSelectProps {
  selectedTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  placeholder?: string;
  className?: string;
}

export function TagMultiSelect({
  selectedTags,
  onTagsChange,
  placeholder = "Seleccionar etiquetas...",
  className = "",
}: TagMultiSelectProps) {
  const [options, setOptions] = useState<TagOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");

  // Cargar tags desde el backend
  const loadTags = async (searchTerm?: string) => {
    setIsLoading(true);
    try {
      const params = searchTerm ? { q: searchTerm } : {};
      const response = await axios.get("/api/posts/tags", { params });
      const tagOptions: TagOption[] = response.data.map((tag: Tag) => ({
        value: tag.TagID,
        label: tag.Name,
      }));
      setOptions(tagOptions);
    } catch (error) {
      console.error("Error cargando tags:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar tags iniciales
  useEffect(() => {
    loadTags();
  }, []);

  // Manejar búsqueda
  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    if (newValue.length >= 2) {
      loadTags(newValue);
    } else if (newValue.length === 0) {
      loadTags();
    }
  };

  // Convertir tags seleccionados a formato de react-select
  const selectedOptions: TagOption[] = selectedTags.map((tag) => ({
    value: tag.TagID,
    label: tag.Name,
  }));

  // Manejar cambio de selección
  const handleChange = (selectedOptions: readonly TagOption[] | null) => {
    const tags: Tag[] = (selectedOptions || []).map((option) => ({
      TagID: option.value,
      Name: option.label,
    }));
    onTagsChange(tags);
  };

  // Eliminar un tag específico
  const removeTag = (tagId: number) => {
    const updatedTags = selectedTags.filter((tag) => tag.TagID !== tagId);
    onTagsChange(updatedTags);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Select
        isMulti
        options={options}
        value={selectedOptions}
        onChange={handleChange}
        onInputChange={handleInputChange}
        inputValue={inputValue}
        isLoading={isLoading}
        placeholder={placeholder}
        noOptionsMessage={() => "No se encontraron etiquetas"}
        loadingMessage={() => "Cargando..."}
        className="react-select-container"
        classNamePrefix="react-select"
        styles={{
          control: (provided) => ({
            ...provided,
            minHeight: "40px",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            "&:hover": {
              borderColor: "#9ca3af",
            },
          }),
          multiValue: (provided) => ({
            ...provided,
            backgroundColor: "#3b82f6",
            color: "white",
          }),
          multiValueLabel: (provided) => ({
            ...provided,
            color: "white",
          }),
          multiValueRemove: (provided) => ({
            ...provided,
            color: "white",
            "&:hover": {
              backgroundColor: "#2563eb",
            },
          }),
        }}
      />

      {/* Mostrar tags seleccionados como badges */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {selectedTags.map((tag) => (
            <Badge
              key={tag.TagID}
              variant="secondary"
              className="bg-blue-50 text-blue-600 hover:bg-blue-100 gap-1"
            >
              {tag.Name}
              <button
                type="button"
                onClick={() => removeTag(tag.TagID)}
                className="rounded-full w-4 h-4 inline-flex items-center justify-center text-blue-600 hover:text-blue-800 hover:bg-blue-200 transition-colors ml-1"
              >
                <FaTimes size={10} />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
} 