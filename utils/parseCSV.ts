import Papa from "papaparse";
import { PapaParseResult } from "./types";

export const defaultOptions = {
  delimiter: ";",
  skipEmptyLines: true,
  newline: "\n",
  header: true,
};

export const parseFile = async (
  file: File,
  onComplete: (data: any) => void
) => {
  Papa.parse(file, {
    ...defaultOptions,
    complete: ({ data }) => {
      onComplete(data as PapaParseResult[]);
    },
  });
};

export const parseString = (string: string) => {
  return Papa.parse(string, defaultOptions).data as PapaParseResult[];
};
