import React from "react";
import TextField from "@mui/material/TextField";
import "../Styles/Search.css";

const Search = ({ onSearch }) => {
  const handleSearchChange = (event) => {
    onSearch(event.target.value);
  };

  return (
    <div>
      <TextField
        className="search"
        label="Search"
        variant="outlined"
        // style={{ width: 400 }}
        onChange={handleSearchChange}
      />
    </div>
  );
};

export default Search;
