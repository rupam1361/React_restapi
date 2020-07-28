import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import axios from "axios";
import jwt_decode from "jwt-decode";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import CircularProgress from "@material-ui/core/CircularProgress";

const url = "/api/v1/users";
const imgUrl = "/uploads";

const SingleProduct = (props) => {
  const history = useHistory();
  let { productId } = useParams();

  const token = localStorage.getItem("access-token");
  const decoded = jwt_decode(token);
  const currentUserId = decoded._id;
  const exp = decoded.exp;

  const [todo, setTodo] = useState({});
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

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

  const deleteProduct = async () => {
    const tokenExpiredTime = exp * 1000;
    const currentTime = new Date().valueOf();
    if (currentTime <= tokenExpiredTime) {
      console.log("Token running..");
      const config = {
        headers: {
          Authorization: token,
        },
      };
      await axios
        .delete(`${url}/${currentUserId}/products/${productId}`, config)
        .then((data) => {
          console.log(data.data);
          props.parentCallback(data.data.message, "success");
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
            .delete(`${url}/${currentUserId}/products/${productId}`, config)
            .then((data) => {
              console.log(data.data);
              props.parentCallback(data.data.message, "success");
            })
            .then(() => history.push("/"));
        });
    }
  };

  const goToUpdateProduct = () => {
    history.push(`/users/${currentUserId}/products/${productId}/update`);
  };

  const goBack = () => {
    history.goBack();
  };

  return (
    <div className="singleTodoContainer">
      <div className="title">
        <ArrowBackIcon onClick={goBack} fontSize="small" />
        <span>Product Details..</span>
        <span></span>
      </div>
      <br />
      <div>
        {isLoading ? (
          <div className="loadingText">
            <CircularProgress size={20} />
            <p>Loading...</p>
          </div>
        ) : (
          <div className="singleProductWrapper">
            <div>
              <strong>{todo.name}</strong>
              <br />
              <span>{todo.description}</span>
              <br />
              <span>
                Price: <strong> &#8377;</strong> {todo.price}
              </span>
            </div>
            <div>
              <img
                src={`${imgUrl}/${todo.productImage}`}
                alt=""
                width="240"
                className="singleImage"
              />
            </div>
          </div>
        )}
      </div>
      <div className="btns">
        <button className="btnEdit" onClick={goToUpdateProduct} color="primary">
          Edit
        </button>
        <button
          className="btnDelete"
          onClick={handleClickOpen}
          color="secondary"
        >
          Delete
        </button>
      </div>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <div className="dialog">
          <label className="deleteTitle" htmlFor="">
            Delete Product?
          </label>
          <br />
          <br />
          <label className="deleteContent">
            Are you sure you want to delete this product?
          </label>
          <br />
          <br />
          <br />
          <DialogActions>
            <button onClick={deleteProduct} className="btnOk">
              OK
            </button>
            <button onClick={handleClose} className="btnOk btnCancel">
              Cancel
            </button>
          </DialogActions>
        </div>
      </Dialog>
    </div>
  );
};

export default SingleProduct;
