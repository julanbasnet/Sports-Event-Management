"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { SPORT_TYPES } from "@/lib/types";

export function SearchFilterBar(): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentQuery = searchParams.get("q") ?? "";
  const currentSport = searchParams.get("sport") ?? "";

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`/dashboard?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search events..."
          defaultValue={currentQuery}
          onChange={(e) => updateParams("q", e.target.value)}
          className="pl-9"
        />
      </div>
      <Select
        value={currentSport}
        onValueChange={(value) =>
          updateParams("sport", value === "all" ? "" : value)
        }
      >
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="All Sports" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Sports</SelectItem>
          {SPORT_TYPES.map((sport) => (
            <SelectItem key={sport} value={sport}>
              {sport}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
