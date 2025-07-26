import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGetProductDetailsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
} from "../../slices/productsApiSlice";

const ProductForm = ({ isEdit = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: existingBook, isLoading } = useGetProductDetailsQuery(id, {
    skip: !isEdit,
  });

  const [createBook] = useCreateProductMutation();
  const [updateBook] = useUpdateProductMutation();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    stock: "",
    discount: "",
    isbn: "",
    publication_date: "",
    publisher_id: "",
  });

  useEffect(() => {
    if (isEdit && existingBook) {
      setFormData({
        ...existingBook,
        publication_date: existingBook.publication_date?.split("T")[0],
      });
    }
  }, [isEdit, existingBook]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await updateBook({ id, ...formData }).unwrap();
        alert("Book updated");
      } else {
        await createBook(formData).unwrap();
        alert("Book created");
      }
      navigate("/admin/productlist");
    } catch (error) {
      console.error(error);
      alert("Error occurred");
    }
  };

  if (isLoading) return <p className="text-center mt-8">Loading book...</p>;

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-xl p-8 mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {isEdit ? "Edit Book" : "Create New Book"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {Object.entries(formData).map(([key, value]) => (
          <div key={key}>
            <label
              htmlFor={key}
              className="block text-sm font-medium text-gray-700 capitalize"
            >
              {key.replace(/_/g, " ")}
            </label>
            <input
              type={
                key === "price" || key === "stock" || key === "discount"
                  ? "number"
                  : key === "publication_date"
                  ? "date"
                  : "text"
              }
              name={key}
              id={key}
              value={value || ""}
              onChange={handleChange}
              required={key !== "discount"}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        ))}

        <div className="text-center">
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-md shadow-md transition duration-300"
          >
            {isEdit ? "Update Book" : "Create Book"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
