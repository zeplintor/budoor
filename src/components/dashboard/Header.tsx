"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui";
import { useTranslations } from "next-intl";

interface HeaderProps {
  title: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  showSearch?: boolean;
}

export function Header({ title, searchValue, onSearchChange, showSearch = true }: HeaderProps) {
  const t = useTranslations();
  const [localSearch, setLocalSearch] = useState("");

  const search = searchValue !== undefined ? searchValue : localSearch;
  const setSearch = onSearchChange || setLocalSearch;

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <h1 className="text-xl font-semibold text-gray-900">{title}</h1>

      {/* Search */}
      {showSearch && (
        <div className="relative hidden md:block">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder={t("common.searchPlaceholder")}
            className="w-64 ps-9 pe-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </header>
  );
}
