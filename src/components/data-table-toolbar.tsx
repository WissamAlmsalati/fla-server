"use client";

import { X } from "lucide-react";
import { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "@/components/data-table-view-options";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

import { DataTableFacetedFilter } from "@/components/data-table-faceted-filter";
import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";

interface DataTableToolbarProps<TData> {
  table?: Table<TData>;
  onSearch?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: {
    columnId?: string; // For local filtering if table is provided
    title: string;
    options: {
      label: string;
      value: string;
      icon?: React.ComponentType<{ className?: string }>;
    }[];
    value?: string; // For remote filtering
    onChange?: (value: string) => void; // For remote filtering
  }[];
}

export function DataTableToolbar<TData>({
  table,
  onSearch,
  searchPlaceholder = "بحث...",
  filters,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table?.getState().columnFilters.length ?? 0 > 0;
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 500);

  useEffect(() => {
    if (onSearch) {
      onSearch(debouncedSearch);
    }
  }, [debouncedSearch, onSearch]);

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {filters?.map((filter) => (
          <div key={filter.title}>
            {filter.columnId && table ? (
              table.getColumn(filter.columnId) && (
                <DataTableFacetedFilter
                  column={table.getColumn(filter.columnId)}
                  title={filter.title}
                  options={filter.options}
                />
              )
            ) : (
              // Remote filter using Select component
              <Select value={filter.value ?? ""} onValueChange={(value: string) => filter.onChange?.(value)}>
                <SelectTrigger className="h-8 w-[150px]">
                  <SelectValue placeholder={filter.title} />
                </SelectTrigger>
                <SelectContent>
                  {filter.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.icon && <option.icon className="mr-2 h-4 w-4 inline" />}{option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        ))}
        
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table?.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      {table && <DataTableViewOptions table={table} />}
    </div>
  );
}
