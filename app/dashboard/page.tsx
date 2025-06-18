"use client";
import React, { useEffect, useState } from "react";
import { myAPPHook } from "@/context/AppProvider";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

interface ProductType {
  id?: number;
  title: string;
  description?: string;
  cost: number;
  file?: string;
  banner_image?: File | string | null;
}

const Dashboard: React.FC = () => {
  const { authToken } = myAPPHook();
  const router = useRouter();

  const [formData, setFormData] = useState<ProductType>({
    title: "",
    description: "",
    cost: 0,
    file: "",
    banner_image: null,
  });

  const [products, setProducts] = useState<ProductType[]>([]);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const fileRef = React.useRef<HTMLInputElement>(null);

  

  const handleOnChangeEvent = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFormData({
        ...formData,
        banner_image: event.target.files[0],
        file: URL.createObjectURL(event.target.files[0]),
      });
    } else {
      setFormData({
        ...formData,
        [event.target.name]: event.target.value,
      });
    }
  };

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      if (isEdit) {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/products/${formData.id}`,
          {
            ...formData,
            _method: "PUT",
          },
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        if (response.data.status) {
          toast.success("Product updated successfully");
          resetForm();
          fetchAllProducts();
        }
      } else {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/products`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        if (response.data.status) {
          toast.success("Product added successfully");
          resetForm();
          fetchAllProducts();
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to add product");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      cost: 0,
      file: "",
      banner_image: null,
    });
    setIsEdit(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        const response = await axios.delete(
          `${process.env.NEXT_PUBLIC_API_URL}/products/${id}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        if (response.data.status) {
          Swal.fire("Deleted!", "Your product has been deleted.", "success");
          fetchAllProducts();
        }
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  const fetchAllProducts = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/products`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      setProducts(response.data.products);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };
  useEffect(() => {
    if (!authToken) {
      router.push("/auth");
      return;
    }
    fetchAllProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken, fetchAllProducts, router]);
  return (
    <div className="container mt-4">
      <div className="row">
        {/* Left Side: Form */}
        <div className="col-md-6">
          <div className="card p-4">
            <h4>{isEdit ? "Edit Product" : "Add Product"}</h4>
            <form onSubmit={handleFormSubmit}>
              <input
                className="form-control mb-2"
                name="title"
                placeholder="Title"
                required
                value={formData.title}
                onChange={handleOnChangeEvent}
              />
              <input
                className="form-control mb-2"
                name="description"
                placeholder="Description"
                required
                value={formData.description}
                onChange={handleOnChangeEvent}
              />
              <input
                className="form-control mb-2"
                name="cost"
                placeholder="Cost"
                type="number"
                required
                value={formData.cost}
                onChange={handleOnChangeEvent}
              />
              <div className="mb-2">
                {formData.file && (
                  <Image
                    src={formData.file}
                    alt="Preview"
                    id="bannerPreview"
                    width={100}
                    height={100}
                  />
                )}
              </div>
              <input
                className="form-control mb-2"
                type="file"
                id="bannerInput"
                ref={fileRef}
                onChange={handleOnChangeEvent}
              />
              <button className="btn btn-primary" type="submit">
                {isEdit ? "Update Product" : "Add Product"}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Table */}
        <div className="col-md-6">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Banner</th>
                <th>Cost</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((singleProduct) => (
                <tr key={singleProduct.id}>
                  <td>{singleProduct.id}</td>
                  <td>{singleProduct.title}</td>
                  <td>
                    {typeof singleProduct.banner_image === "string" ? (
                      <Image
                        src={singleProduct.banner_image}
                        alt="Product"
                        width={50}
                        height={50}
                      />
                    ) : (
                      "No Image"
                    )}
                  </td>
                  <td>{singleProduct.cost}</td>
                  <td>
                    <button
                      className="btn btn-warning btn-sm me-2"
                      onClick={() => {
                        setFormData({
                          id: singleProduct.id,
                          title: singleProduct.title,
                          cost: singleProduct.cost,
                          description: singleProduct.description,
                          file:
                            typeof singleProduct.banner_image === "string"
                              ? singleProduct.banner_image
                              : undefined,
                          banner_image: null,
                        });
                        setIsEdit(true);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteProduct(singleProduct.id!)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
