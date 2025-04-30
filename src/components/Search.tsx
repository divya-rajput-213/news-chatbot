// components/SearchForm.tsx

import React from 'react';
import { TextField, Button, Box } from '@mui/material';
import { SearchFormProps } from '@/types/types';

const SearchForm: React.FC<SearchFormProps> = ({ query, setQuery, handleSearch }) => {
  return (
    <form onSubmit={(e) => handleSearch(e)}>
      <Box sx={{ display: "flex", gap: 2, position: "relative" }}>
        <TextField
          fullWidth
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for topics, headlines, etc."
          variant="outlined"
        />
        <Button type="submit" variant="contained" color="primary" sx={{ px: 4 }}>
          Search
        </Button>
      </Box>
    </form>
  );
};

export default SearchForm;
