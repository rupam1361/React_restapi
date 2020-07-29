import React, { useState, useEffect, useRef } from "react";
import { useHistory, useParams } from "react-router-dom";
import axios from "axios";
import jwt_decode from "jwt-decode";
import Alert from "@material-ui/lab/Alert";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import TitleRoundedIcon from "@material-ui/icons/TitleRounded";
import DescriptionOutlinedIcon from "@material-ui/icons/DescriptionOutlined";
import EuroIcon from "@material-ui/icons/Euro";
import CircularProgress from "@material-ui/core/CircularProgress";

const url = "/api/v1/users";
const imageUrl = "/uploads";

const UpdateProduct = (props) => {
  const history = useHistory();

  let [todo, setTodo] = useState({});
  let [myImage, setMyImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  let [displayImage, setDisplayImage] = useState(null);
  const [errors, setErrors] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  let { productId } = useParams();

  const token = localStorage.getItem("access-token");
  const decoded = jwt_decode(token);
  const currentUserId = decoded._id;
  const exp = decoded.exp;

  const name = useRef();
  const description = useRef();
  const price = useRef();

  useEffect(() => {
    const getTodo = async () => {
      const tokenExpiredTime = exp * 1000;
      const currentTime = new Date().valueOf();
      if (currentTime <= tokenExpiredTime) {
        console.log("Token running..");
        const config = {
          headers: {
            Authorization: token,
          },
        };
        const result = await axios.get(
          `${url}/${currentUserId}/products/${productId}`,
          config
        );
        console.log(result.data.data[0]);
        setTodo(result.data.data[0]);
        setIsLoading(false);
      } else {
        console.log("Token expired..");
        const refreshToken = localStorage.getItem("refresh-token");
        await axios
          .post(`${url}/refresh-token`, {
            refreshToken: refreshToken,
          })
          .then(async (data) => {
            localStorage.setItem("access-token", data.data.accessToken);
            const config = {
              headers: {
                Authorization: data.data.accessToken,
              },
            };
            const result = await axios.get(
              `${url}/${currentUserId}/products/${productId}`,
              config
            );
            console.log(result.data.data[0]);
            setTodo(result.data.data[0]);
            setIsLoading(false);
          });
      }
    };
    getTodo();
  }, [currentUserId, productId, token, exp]);

  const onImageSelect = (e) => {
    console.log(e.target.files[0]);
    setMyImage(e.target.files[0]);
    if (e.target.files[0]) {
      setDisplayImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  const updateProduct = async () => {
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
    } else {
      setIsSaving(true);
      const formData = new FormData();
      if (myImage) {
        formData.append("myImage", myImage, myImage.name);
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
                .put(
                  `${url}/${currentUserId}/products/${productId}`,
                  {
                    name: name.current.value,
                    description: description.current.value,
                    price: parseFloat(price.current.value),
                    productImage: myImage != null ? myImage.name : null,
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
                    .put(
                      `${url}/${currentUserId}/products/${productId}`,
                      {
                        name: name.current.value,
                        description: description.current.value,
                        price: parseFloat(price.current.value),
                        productImage: myImage != null ? myImage.name : null,
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
      } else {
        if (currentTime <= tokenExpiredTime) {
          console.log("Token running..");
          const config = {
            headers: {
              Authorization: token,
            },
          };

          await axios
            .put(
              `${url}/${currentUserId}/products/${productId}`,
              {
                name: name.current.value,
                description: description.current.value,
                price: parseFloat(price.current.value),
                productImage: myImage != null ? myImage.name : null,
              },
              config
            )
            .then((data) => {
              console.log(data.data);
              props.parentCallback(data.data.message, "success");
              setIsSaving(false);
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
                .put(
                  `${url}/${currentUserId}/products/${productId}`,
                  {
                    name: name.current.value,
                    description: description.current.value,
                    price: parseFloat(price.current.value),
                    productImage: myImage != null ? myImage.name : null,
                  },
                  config
                )
                .then((data) => {
                  console.log(data.data);
                  props.parentCallback(data.data.message, "success");
                  setIsSaving(false);
                })
                .then(() => history.push("/"));
            });
        }
      }
    }
  };

  const goBack = () => {
    history.goBack();
  };

  return (
    <div className="updateTodoContainer">
      <div className="title">
        <ArrowBackIcon onClick={goBack} fontSize="small" />
        <span>Update a Product..</span>
        <span></span>
      </div>
      <br />
      {isLoading ? (
        <div className="loadingTextAllProduct">
          <CircularProgress size={20} />
          <p>Loading...</p>
        </div>
      ) : (
        <div className="formWrapper">
          <label className="label">Title</label>
          <br />
          <div className="inputWrapper">
            <TitleRoundedIcon fontSize="small" className="mailIcon" />
            <input
              className="inputText"
              type="text"
              placeholder="Product Title"
              ref={name}
              defaultValue={todo.name}
            />
          </div>
          <br />
          <label className="label">Description</label>
          <br />

          <div className="inputWrapper">
            <DescriptionOutlinedIcon fontSize="small" className="mailIcon" />
            <input
              className="inputText"
              type="text"
              ref={description}
              placeholder="Product Description"
              defaultValue={todo.description}
            />
          </div>
          <br />
          <label className="label">Price</label>
          <br />
          <div className="inputWrapper">
            <EuroIcon fontSize="small" className="mailIcon" />
            <input
              className="inputText"
              type="number"
              ref={price}
              placeholder="Product Price"
              defaultValue={todo.price}
            />
          </div>
          <br />
          <div>
            <label className="label">
              Change image <span>(Click on the image..)</span>
            </label>
            <br />
            <div className="choooseImageContainer">
              <label htmlFor="myImage" className="fileInput">
                <img
                  className="product-image"
                  src={
                    displayImage
                      ? displayImage
                      : `${imageUrl}/${todo.productImage}`
                  }
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
          <button className="btn" onClick={updateProduct}>
            {isSaving ? (
              <span className="loginLoading">
                <CircularProgress size={15} /> <span>Saving..</span>
              </span>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default UpdateProduct;
