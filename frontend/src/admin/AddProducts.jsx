import React, { useState } from "react";
import { Container, Row, Col, Form, FormGroup, Button } from "reactstrap";
import { toast } from "react-toastify";

import { db, storage } from "../firebase.config";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";

import AddProductLoader from "../components/Loader/AddProductLoader";
import Helmet from "../components/Helmet/Helmet";
import CommonSection from "../components/UI/CommonSection";

const AddProducts = () => {
  const [productTitle, setProductTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("chair");
  const [productImage, setProductImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProductImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const addProduct = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!productImage) {
      toast.error("Please upload an image.");
      setLoading(false);
      return;
    }

    const imageRef = ref(
      storage,
      `productImages/${Date.now() + productImage.name}`
    );
    const uploadTask = uploadBytesResumable(imageRef, productImage);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(`Upload is ${progress}% done`);
      },
      (error) => {
        toast.error("Image upload failed: " + error);
        setLoading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
          console.log("File available at", downloadURL);

          try {
            await addDoc(collection(db, "products"), {
              productName: productTitle,
              shortDesc: shortDescription,
              description: description,
              category: category,
              price: Number(price),
              imgUrl: downloadURL,
            });
            toast.success("Product added successfully!");

            setProductTitle("");
            setShortDescription("");
            setDescription("");
            setPrice("");
            setCategory("chair");
            setProductImage(null);
            setPreviewImage(null);
          } catch (error) {
            toast.error("Error adding product: " + error);
          }
          setLoading(false);
        });
      }
    );
  };

  return (
    <Helmet title="Add Product">
      <CommonSection title="Add your product" />
      <section>
        <Container>
          <Row>
            <Col lg="12">
              <h4 className="mb-5">Add Product</h4>
              <Form onSubmit={addProduct}>
                <FormGroup className="form__group">
                  <span>Product title</span>
                  <input
                    type="text"
                    placeholder="Double sofa"
                    value={productTitle}
                    onChange={(e) => setProductTitle(e.target.value)}
                  />
                </FormGroup>
                <FormGroup className="form__group">
                  <span>Short Description</span>
                  <input
                    type="text"
                    placeholder="lorem...."
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                  />
                </FormGroup>

                <FormGroup className="form__group">
                  <span>Description</span>
                  <input
                    type="text"
                    placeholder="Description......"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </FormGroup>
                <div className="d-flex align-items-center justify-content-between gap-5">
                  <FormGroup className="form__group w-50">
                    <span>Price</span>
                    <input
                      type="text"
                      placeholder="₱100"
                      value={price.startsWith("₱") ? price : `₱${price}`}
                      onChange={(e) => {
                        const value = e.target.value;

                        const formattedValue = value.startsWith("₱")
                          ? value
                          : `₱${value}`;

                        const numericValue = formattedValue.replace(
                          /[^0-9.]/g,
                          ""
                        );
                        setPrice(numericValue);
                      }}
                    />
                  </FormGroup>

                  <FormGroup className="form__group w-50">
                    <span>Category</span>
                    <select
                      className="w-100 p-2"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option>Select category</option>
                      <option value="chair">Chair</option>
                      <option value="sofa">Sofa</option>
                      <option value="mobile">Mobile</option>
                      <option value="watch">Watch</option>
                      <option value="wireless">Wireless</option>
                    </select>
                  </FormGroup>
                </div>

                <div>
                  <FormGroup className="form__group">
                    <span>Product Image</span>
                    <input type="file" onChange={handleImageChange} />
                    {previewImage && (
                      <img
                        src={previewImage}
                        alt="Preview"
                        style={{
                          maxWidth: "200px",
                          marginTop: "10px",
                          borderRadius: "8px",
                        }}
                      />
                    )}
                  </FormGroup>
                </div>

                <Button className="buy__btn" type="submit" disabled={loading}>
                  {loading ? <AddProductLoader /> : "Add Product"}
                </Button>
              </Form>
            </Col>
          </Row>
        </Container>
      </section>
    </Helmet>
  );
};

export default AddProducts;
