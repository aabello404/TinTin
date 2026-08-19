import { useState, type ChangeEvent, type FormEvent } from "react";
import styles from "../../pages/Dashboard.module.css";

type CategoryOption = {
  id: string;
  name: string;
  slug: string;
};

type AddListingFormProps = {
  categories: CategoryOption[];
  onCreated: () => void;
};

const API_BASE_URL = import.meta.env.VITE_NEST_URL;

const AddListingForm = ({ categories, onCreated }: AddListingFormProps) => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    categoryId: "",
    price: "",
    images: [] as File[],
  });
  const [sizeRows, setSizeRows] = useState<{size: string; quantity: string}[]>([{size: "", quantity: ""}]);

  const addSizeRow = () => setSizeRows(prev => [...prev, {size: "", quantity: ""}]);

  const updateSizeRow = (index: number, field: 'size' | 'quantity', value: string) => {
    setSizeRows(prev => {
      const newRows = [...prev];
      newRows[index][field] = value;
      return newRows;
    });
  };

  const removeSizeRow = (index: number) => {
    setSizeRows(prev => prev.filter((_, i) => i !== index));
  };

  // Removed parseSizes as it is no longer needed

  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImagesChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    if (selectedFiles.length > 5) {
      setError("Choose up to 5 images.");
      event.target.value = "";
      return;
    }
    setError("");
    setForm((prev) => ({ ...prev, images: selectedFiles }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name.trim() || !form.description.trim()) {
      setError("Name and description are required.");
      return;
    }

    if (!form.categoryId) {
      setError("Please select a category.");
      return;
    }

    const parsedPrice = Number(form.price);
    if (!form.price || Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      setError("Please enter a valid price.");
      return;
    }

    const sizes = sizeRows.reduce((acc, row) => {
      if (row.size && row.quantity) {
        acc[row.size] = Number(row.quantity);
      }
      return acc;
    }, {} as Record<string, number>);

    if (form.images.length === 0) {
      setError("Add at least one product image.");
      return;
    }

    if (Object.keys(sizes).length === 0) {
      setError("Add at least one size and quantity.");
      return;
    }

    const hasInvalidSize = Object.entries(sizes).some(
      ([size, quantity]) =>
        !/^\d+$/.test(size) ||
        !Number.isInteger(Number(size)) ||
        !Number.isInteger(quantity) ||
        quantity < 0,
    );
    if (hasInvalidSize) {
      setError(
        "Sizes must be numeric and quantities must be whole numbers greater than or equal to 0.",
      );
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("tintin_token");

      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("categoryId", form.categoryId);
      formData.append("price", String(parsedPrice));
      formData.append("sizes", JSON.stringify(sizes));
      form.images.forEach((image) => formData.append("images", image));

      const response = await fetch(`${API_BASE_URL}/listings`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message ?? "Unable to create listing.");
      }

      setSuccess("Listing created successfully.");
      setForm({
        name: "",
        description: "",
        categoryId: "",
        price: "",
        images: [],
      });
      setSizeRows([{size: "", quantity: ""}]);
      onCreated();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to create listing.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className={styles.formPanel}>
      <div className={styles.panelHeader}>
        <h2>Add new listing</h2>
      </div>

      {error && (
        <div className={styles.alert}>
          <strong>Action required:</strong> {error}
        </div>
      )}

      {success && <div className={styles.success}>{success}</div>}

      <form className={styles.listingForm} onSubmit={handleSubmit}>
        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span>Listing name</span>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Classic Oxford"
            />
          </label>

          <label className={styles.field}>
            <span>Category</span>
            <select
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span>Price</span>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="45000"
              min="1"
            />
          </label>

          <label className={styles.fieldFull}>
            <span>Product photos (up to 5)</span>
            <input
              type="file"
              name="images"
              accept="image/*"
              multiple
              onChange={handleImagesChange}
            />
            {form.images.length > 0 && (
              <small>{form.images.length} photo(s) selected</small>
            )}
          </label>

          <label className={styles.fieldFull}>
            <span>Description</span>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Enter product details"
              rows={4}
            />
          </label>

          <div className={styles.fieldFull}>
            <span>Sizes and stock</span>
            <table className={styles.sizesTable}>
              <thead>
                <tr>
                  <th>Quantity</th>
                  <th>Size</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {sizeRows.map((row, index) => (
                  <tr key={index}>
                    <td>
                      <input 
                        type="number" 
                        min="0"
                        value={row.quantity} 
                        onChange={(e) => updateSizeRow(index, 'quantity', e.target.value)}
                        placeholder="Quantity"
                      />
                    </td>
                    <td>
                      <select 
                        value={row.size} 
                        onChange={(e) => updateSizeRow(index, 'size', e.target.value)}
                      >
                        <option value="">Select size</option>
                        {Array.from({length: 15}, (_, i) => 36 + i).map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button type="button" onClick={() => removeSizeRow(index)} className={styles.removeBtn}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button type="button" onClick={addSizeRow} className={styles.addBtn}>+ Add Size</button>
          </div>
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={submitting}
        >
          {submitting ? "Creating listing..." : "Create listing"}
        </button>
      </form>
    </section>
  );
};

export default AddListingForm;
