import { FormEvent } from "react";

// Define the type for each article object
export interface Article {
  title: string;
  snippet: string;
  link: string;
  date: string;
}

// Define the type for the props
export interface NewsCardProps {
  news: Article[]; // Array of articles
}
export interface SearchFormProps {
  query: string;
  setQuery: (query: string) => void;
  handleSearch: (e: FormEvent<HTMLFormElement> | null, query?: string) => void;
}