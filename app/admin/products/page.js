"use client";

import { Archive, Flower2, Gift, ImagePlus, PackagePlus, Pencil, Save, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  createApiProduct,
  deleteApiProduct,
  fetchAdminProducts,
  formatCurrency,
  resolveProductImageUrl,
  updateApiProduct,
} from "../../_lib/api";
import AdminShell from "../_components/AdminShell";

const emptyForm = {
  id: null,
  name: "",
  slug: "",
  category: "",
  price: "",
  stock: "",
  description: "",
  image: "",
  is_active: true,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState("");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formState, setFormState] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (!imageFile) {
      return;
    }

    const preview = URL.createObjectURL(imageFile);
    setImagePreview(preview);

    return () => URL.revokeObjectURL(preview);
  }, [imageFile]);

  async function loadProducts() {
    try {
      setProducts(await fetchAdminProducts());
    } catch (error) {
      setMessage(error.message || "Unable to load products from the API.");
    }
  }

  const productStats = useMemo(() => {
    const categories = new Set(products.map((product) => product.category));
    return {
      active: products.filter((product) => product.is_active).length,
      lowStock: products.filter((product) => Number(product.stock || 0) <= 6).length,
      categories: categories.size,
      newest: products.slice(0, 3).length,
    };
  }, [products]);

  function openCreateForm() {
    setIsEditorOpen(true);
    setEditingProduct(null);
    setFormState(emptyForm);
    setImageFile(null);
    setImagePreview("");
    setMessage("");
  }

  function openEditForm(product) {
    setIsEditorOpen(true);
    setEditingProduct(product);
    setFormState({
      id: product.id,
      name: product.name || "",
      slug: product.slug || "",
      category: product.category || "",
      price: Number(product.price || 0),
      stock: Number(product.stock || 0),
      description: product.description || "",
      image: product.image || "",
      is_active: Boolean(product.is_active),
    });
    setImageFile(null);
    setImagePreview(resolveProductImageUrl(product.image) || "");
    setMessage("");
  }

  function closeForm() {
    setIsEditorOpen(false);
    setEditingProduct(null);
    setFormState(emptyForm);
    setImageFile(null);
    setImagePreview("");
  }

  function updateField(field, value) {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");

    const payload = {
      name: formState.name,
      slug: formState.slug,
      category: formState.category,
      price: formState.price,
      stock: formState.stock,
      description: formState.description,
      is_active: formState.is_active ? "1" : "0",
      image: imageFile,
    };

    try {
      const savedProduct = editingProduct
        ? await updateApiProduct(editingProduct.id, payload)
        : await createApiProduct(payload);

      setProducts((current) => {
        if (!editingProduct) {
          return [savedProduct, ...current];
        }

        return current.map((product) =>
          product.id === savedProduct.id ? savedProduct : product
        );
      });
      setMessage(`${savedProduct.name} saved successfully.`);
      closeForm();
    } catch (error) {
      setMessage(error.message || "Unable to save product.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(product) {
    const isConfirmed = window.confirm("Are you sure you want to delete this product?");
    if (!isConfirmed) {
      return;
    }

    setMessage("");
    try {
      const result = await deleteApiProduct(product.id);
      if (result.deleted) {
        setProducts((current) => current.filter((item) => item.id !== product.id));
      } else if (result.data) {
        setProducts((current) =>
          current.map((item) => (item.id === result.data.id ? result.data : item))
        );
      }
      setMessage(result.message || `${product.name} deleted successfully.`);
    } catch (error) {
      setMessage(error.message || "Unable to delete product.");
    }
  }

  return (
    <AdminShell>
      <section className="admin-main container">
        <header className="admin-header">
          <div>
            <p className="eyebrow">Product Management</p>
            <h1>Maintain the catalog customers see.</h1>
            <p>
              Add bouquet categories, update stock, adjust prices, and retire
              products when supplies run low.
            </p>
          </div>
          <button className="button primary" onClick={openCreateForm} type="button">
            Add Product
          </button>
        </header>

        {message ? <p className="admin-message">{message}</p> : null}

        <section className="admin-page-kpis" aria-label="Product summary">
          <article>
            <Flower2 size={25} />
            <strong>{productStats.active}</strong>
            <span>Active Products</span>
          </article>
          <article>
            <Archive size={25} />
            <strong>{productStats.lowStock}</strong>
            <span>Low Stock</span>
          </article>
          <article>
            <Gift size={25} />
            <strong>{productStats.categories}</strong>
            <span>Categories</span>
          </article>
          <article>
            <PackagePlus size={25} />
            <strong>{productStats.newest}</strong>
            <span>New This Week</span>
          </article>
        </section>

        <section className="admin-product-card-grid">
          {products.length ? (
            products.map((product) => (
              <article
                className={`admin-product-card ${product.is_active ? "" : "inactive"}`}
                key={product.id}
              >
                <img
                  src={resolveProductImageUrl(product.image) || "/products/pink-serenity-clean.png"}
                  alt={product.name}
                />
                <div>
                  <span>{product.category}</span>
                  <h2>{product.name}</h2>
                  <p>{formatCurrency(product.price)}</p>
                </div>
                <footer>
                  <b>{product.stock} stok</b>
                  <em>{product.is_active ? "Aktif" : "Nonaktif"}</em>
                  <button
                    aria-label={`Edit ${product.name}`}
                    onClick={() => openEditForm(product)}
                    type="button"
                  >
                    <Pencil size={17} />
                  </button>
                  <button
                    aria-label={`Delete ${product.name}`}
                    className="danger"
                    onClick={() => handleDelete(product)}
                    type="button"
                  >
                    <Trash2 size={17} />
                  </button>
                </footer>
              </article>
            ))
          ) : (
            <p className="admin-empty">No products returned from the API yet.</p>
          )}
        </section>
      </section>

      {isEditorOpen ? (
        <div className="admin-modal-backdrop" role="presentation">
          <section className="admin-product-modal" aria-labelledby="product-editor-title">
            <header>
              <div>
                <p className="eyebrow">Catalog Item</p>
                <h2 id="product-editor-title">
                  {editingProduct ? "Edit Product" : "Add Product"}
                </h2>
              </div>
              <button aria-label="Close editor" onClick={closeForm} type="button">
                <X size={20} />
              </button>
            </header>

            <form className="admin-product-form" onSubmit={handleSubmit}>
              <div className="admin-image-editor">
                <img
                  src={imagePreview || "/products/pink-serenity-clean.png"}
                  alt={formState.name || "Product preview"}
                />
                <label>
                  <ImagePlus size={17} />
                  Change image
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) => setImageFile(event.target.files?.[0] || null)}
                  />
                </label>
              </div>

              <div className="admin-product-fields">
                <label>
                  <span>Name</span>
                  <input
                    value={formState.name}
                    onChange={(event) => updateField("name", event.target.value)}
                    required
                  />
                </label>
                <label>
                  <span>Slug</span>
                  <input
                    value={formState.slug}
                    onChange={(event) => updateField("slug", event.target.value)}
                    placeholder="Generated from name if blank"
                  />
                </label>
                <label>
                  <span>Category / Type</span>
                  <input
                    value={formState.category}
                    onChange={(event) => updateField("category", event.target.value)}
                    required
                  />
                </label>
                <label>
                  <span>Price</span>
                  <input
                    min="0"
                    step="1000"
                    type="number"
                    value={formState.price}
                    onChange={(event) => updateField("price", event.target.value)}
                    required
                  />
                </label>
                <label>
                  <span>Stock</span>
                  <input
                    min="0"
                    type="number"
                    value={formState.stock}
                    onChange={(event) => updateField("stock", event.target.value)}
                  />
                </label>
                <label className="admin-active-toggle">
                  <input
                    type="checkbox"
                    checked={formState.is_active}
                    onChange={(event) => updateField("is_active", event.target.checked)}
                  />
                  <span>Active in storefront</span>
                </label>
                <label className="wide">
                  <span>Description</span>
                  <textarea
                    rows={4}
                    value={formState.description}
                    onChange={(event) => updateField("description", event.target.value)}
                  />
                </label>
              </div>

              <footer>
                <button className="button secondary" onClick={closeForm} type="button">
                  Cancel
                </button>
                <button className="button primary" disabled={isSaving} type="submit">
                  <Save size={17} />
                  {isSaving ? "Saving..." : "Save Product"}
                </button>
              </footer>
            </form>
          </section>
        </div>
      ) : null}
    </AdminShell>
  );
}
