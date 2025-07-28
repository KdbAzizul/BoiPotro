import React from "react";
import { Box, IconButton, TextField } from "@mui/material";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";

const QuantitySelector = ({ qty, setQty, stock }) => {
  const handleChange = (e) => {
    const val = e.target.value;

    if (val === "") {
      setQty("");
      return;
    }

    const num = Number(val);
    if (!isNaN(num) && num >= 1 && num <= stock) {
      setQty(num);
    }
  };

  const handleBlur = () => {
    if (qty === "" || qty < 1) {
      setQty(1);
    }
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <IconButton
        size="small"
        onClick={() => setQty(qty > 1 ? qty - 1 : 1)}
        disabled={qty <= 1}
        sx={{ 
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1
        }}
      >
        <RemoveIcon fontSize="small" />
      </IconButton>

      <TextField
        type="number"
        value={qty}
        onChange={handleChange}
        onBlur={handleBlur}
        inputProps={{ 
          min: 1, 
          max: stock,
          style: { textAlign: 'center' }
        }}
        sx={{ 
          width: "80px",
          '& .MuiOutlinedInput-root': {
            borderRadius: 1
          }
        }}
      />

      <IconButton
        size="small"
        onClick={() => setQty(qty < stock ? qty + 1 : qty)}
        disabled={qty >= stock}
        sx={{ 
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1
        }}
      >
        <AddIcon fontSize="small" />
      </IconButton>
    </Box>
  );
};

export default QuantitySelector;
