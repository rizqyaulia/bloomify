"use client";

import { Search } from "lucide-react";
import { useId } from "react";

export default function CatalogSearchForm({
  className = "search-pill",
  iconSize = 18,
  inputClassName,
  placeholder = "Search flowers...",
}) {
  const searchId = useId();

  return (
    <form className={className} action="/catalog">
      <Search size={iconSize} aria-hidden="true" />
      <label className="sr-only" htmlFor={searchId}>
        Search flowers
      </label>
      <input
        className={inputClassName}
        id={searchId}
        name="search"
        type="search"
        placeholder={placeholder}
      />
    </form>
  );
}
