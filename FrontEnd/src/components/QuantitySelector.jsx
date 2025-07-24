import React from "react";
import { Button, Form } from "react-bootstrap";

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
    <div className="d-flex align-items-center">
      <Button
        variant="outline-secondary"
        size="sm"
        onClick={() => setQty(qty > 1 ? qty - 1 : 1)}
        disabled={qty <= 1}
      >
        -
      </Button>

      <Form.Control
        type="number"
        value={qty}
        onChange={handleChange}
        onBlur={handleBlur}
        className="mx-2 text-center"
        style={{ width: "60px" }}
        inputMode="numeric"
        pattern="[0-9]*"
      />

      <Button
        variant="outline-secondary"
        size="sm"
        onClick={() => setQty(qty < stock ? qty + 1 : qty)}
        disabled={qty >= stock}
      >
        +
      </Button>
    </div>
  );
};

export default QuantitySelector;
