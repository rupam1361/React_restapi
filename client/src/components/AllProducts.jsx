import React, { useState, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import Fab from "@material-ui/core/Fab";
import AddIcon from "@material-ui/icons/Add";
import Snackbar from "@material-ui/core/Snackbar";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import Pagination from "@material-ui/lab/Pagination";
import CircularProgress from "@material-ui/core/CircularProgress";

import axios from "axios";
import jwt_decode from "jwt-decode";

const url = "/api/v1/users";
const imgUrl = "/uploads";

const AllProducts = (props) => {
  let [todos, setTodos] = useState([]);
  const [open, setOpen] = useState(false);
  const token = localStorage.getItem("access-token");
  const decoded = jwt_decode(token);
  const currentUserId = decoded._id;
  const exp = decoded.exp;
  const history = useHistory();
  console.log(props.message);

  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(3);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getTodos = async () => {
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
          `${url}/${currentUserId}/products`,
          config
        );
        setTodos(result.data.data);
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
              `${url}/${currentUserId}/products`,
              config
            );
            setTodos(result.data.data);
            setIsLoading(false);
          });
      }
      if (props.message) {
        setOpen(true);
      }
    };
    getTodos();
  }, [currentUserId, token, exp, props.message]);

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = todos.slice(indexOfFirstPost, indexOfLastPost);

  const changePage = (event, value) => {
    console.log(value);
    setCurrentPage(value);
  };

  const goToAddProduct = () => {
    history.push(`/users/${currentUserId}/add_product`);
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  return (
    <div className="allTodoContainer">
      <div className="title">
        <span></span>
        <span>My Products</span>
        <span></span>
      </div>
      {props.message ? (
        <Snackbar
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          open={open}
          autoHideDuration={4000}
          onClose={handleClose}
          message={props.message}
          action={
            <React.Fragment>
              <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                onClick={handleClose}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </React.Fragment>
          }
        />
      ) : null}
      <div className="liWrapper">
        {isLoading ? (
          <div className="loadingTextAllProduct">
            <CircularProgress size={20} />
            <p>Loading...</p>
          </div>
        ) : currentPosts.length > 0 ? (
          currentPosts.map((todo, i) => (
            <div className="li" key={i}>
              <div className="litag">
                <img
                  src={`${imgUrl}/${todo.productImage}`}
                  alt=""
                  className="productImage"
                />
                <div>
                  <span>{todo.name}</span>
                  <br />
                  <span>
                    Price: <strong> &#8377;</strong> {todo.price}
                  </span>
                  <div className="createdDate">
                    <strong>Created At:</strong> <span>{todo.createdAt}</span>
                  </div>
                </div>
              </div>
              <Link
                className="link"
                to={`users/${currentUserId}/products/${todo._id}`}
              >
                More...
              </Link>
            </div>
          ))
        ) : (
          <div className="noProductsTitle">
            <h3>You have no Products</h3>
            <p>Click on the '+' button to add one..</p>
          </div>
        )}
      </div>
      <Pagination
        className="paginatePos"
        onChange={changePage}
        count={Math.ceil(todos.length / postsPerPage)}
        size="small"
      />
      <Fab
        size="medium"
        color="primary"
        onClick={goToAddProduct}
        className="fabBtn"
        aria-label="add"
      >
        <AddIcon />
      </Fab>
    </div>
  );
};

export default AllProducts;
