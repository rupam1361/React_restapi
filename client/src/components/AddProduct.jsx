import React, { useState, useRef } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";
import baseImage from "../assets/water-rainy-rain-raindrops-110874.jpg";
import jwt_decode from "jwt-decode";
import Alert from "@material-ui/lab/Alert";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import TitleRoundedIcon from "@material-ui/icons/TitleRounded";
import DescriptionOutlinedIcon from "@material-ui/icons/DescriptionOutlined";
import CircularProgress from "@material-ui/core/CircularProgress";

import EuroIcon from "@material-ui/icons/Euro";

const url = "/api/v1/users";

const AddProduct = (props) => {
  const history = useHistory();

  const token = localStorage.getItem("access-token");
  const decoded = jwt_decode(token);
  const currentUserId = decoded._id;
  const exp = decoded.exp;

  const name = useRef();
  const description = useRef();
  const price = useRef();
  let [myImage, setMyImage] = useState(null);
  let [displayImage, setDisplayImage] = useState(null);
  const [errors, setErrors] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const onImageSelect = (e) => {
    console.log(e.target.files[0]);
    setMyImage(e.target.files[0]);
    if (e.target.files[0]) {
      setDisplayImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  const addProduct = async () => {
    const tokenExpiredTime = exp * 1000;
    const currentTime = new Date().valueOf();
    if (
      name.current.value === "" &&
      description.current.value === "" &&
      price.current.value === ""
    ) {
      setErrors("All fields are required..");
    } else if (name.current.value === "") {
      setErrors("Product title cannot be empty..");
    } else if (description.current.value === "") {
      setErrors("Description cannot be empty..");
    } else if (price.current.value === "") {
      setErrors("Price cannot be empty..");
    } else if (myImage === null) {
      setErrors("Please choose a product image");
    } else {
      setIsSaving(true);

      const formData = new FormData();
      formData.append("myImage", myImage, myImage.name);
      console.log(myImage.name);

      if (currentTime <= tokenExpiredTime) {
        console.log("Token running..");
        const config = {
          headers: {
            Authorization: token,
          },
        };

        await axios
          .post(`${url}/uploads`, formData)
          .then(async () => {
            await axios
              .post(
                `${url}/${currentUserId}/products`,
                {
                  name: name.current.value,
                  description: description.current.value,
                  price: parseFloat(price.current.value),
                  productImage: myImage.name,
                  userId: currentUserId,
                },
                config
              )
              .then((data) => {
                console.log(data.data);
                props.parentCallback(data.data.message, "success");
                setIsSaving(false);
              });
          })

          .then(() => history.push("/"));
      } else {
        console.log("Token expired..");
        const refreshToken = localStorage.getItem("refresh-token");
        await axios
          .post(`${url}/refresh-token`, {
            refreshToken: refreshToken,
          })
          .then(async (data) => {
            const config = {
              headers: {
                Authorization: data.data.accessToken,
              },
            };
            await axios
              .post(`${url}/uploads`, formData)
              .then(async () => {
                await axios
                  .post(
                    `${url}/${currentUserId}/products`,
                    {
                      name: name.current.value,
                      description: description.current.value,
                      price: parseFloat(price.current.value),
                      productImage: myImage.name,
                      userId: currentUserId,
                    },
                    config
                  )
                  .then((data) => {
                    console.log(data.data);
                    props.parentCallback(data.data.message, "success");
                    setIsSaving(false);
                  });
              })

              .then(() => history.push("/"));
          });
      }
    }
  };

  const goBack = () => {
    history.goBack();
  };

  return (
    <div className="addTodoContainer">
      <div className="title">
        <ArrowBackIcon onClick={goBack} fontSize="small" />
        <span>Add a new Product..</span>
        <span></span>
      </div>
      <br />
      <ion-icon name="arrow-back-outline"></ion-icon>
      <div className="formWrapper">
        <label className="label">Title</label>
        <br />
        <div className="inputWrapper">
          <TitleRoundedIcon fontSize="small" className="mailIcon" />
          <input
            className="inputText"
            ref={name}
            type="text"
            placeholder="Product Title"
          />
        </div>
        <br />
        <label className="label">Description</label>
        <br />
        <div className="inputWrapper">
          <DescriptionOutlinedIcon fontSize="small" className="mailIcon" />
          <input
            className="inputText"
            ref={description}
            type="text"
            placeholder="Product Description"
          />
        </div>
        <br />
        <label className="label">Price</label>
        <br />
        <div className="inputWrapper">
          <EuroIcon fontSize="small" className="mailIcon" />
          <input
            className="inputText"
            ref={price}
            type="number"
            placeholder="39.45"
          />
        </div>
        <br />
        <div>
          <label className="label">
            Choose an image <span>(Click on the image..)</span>
          </label>
          <br />
          <div className="choooseImageContainer">
            <label htmlFor="myImage" className="fileInput">
              <img
                className="product-image"
                src={displayImage ? displayImage : baseImage}
                alt=""
                width="120"
              />
            </label>
            <input
              type="file"
              id="myImage"
              name="myImage"
              onChange={onImageSelect}
            />
          </div>
        </div>
        <br />
        {errors ? (
          <Alert severity="error" className="errorMessage">
            {errors}
          </Alert>
        ) : (
          <></>
        )}
        <button className="btn" onClick={addProduct}>
          {isSaving ? (
            <span className="loginLoading">
              <CircularProgress size={15} /> <span>Adding..</span>
            </span>
          ) : (
            "Add Product"
          )}
        </button>
      </div>
    </div>
  );
};

export default AddProduct;
