import React, { useState } from "react";
import { Switch, Route, useHistory } from "react-router-dom";

import jwt_decode from "jwt-decode";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";

import "./App.css";
import SingleProduct from "./components/SingleProduct";
import AllProducts from "./components/AllProducts";
import AddProduct from "./components/AddProduct";
import UpdateProduct from "./components/UpdateProduct";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ForgotPassWord from "./components/ForgotPassword";
import PasswordLinkSendSuccess from "./components/PasswordLinkSendSuccess";
import ResetPassword from "./components/ResetPassword";
import ResetPasswordSuccess from "./components/ResetPasswordSuccess";

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";
import IconButton from "@material-ui/core/IconButton";
import AccountCircle from "@material-ui/icons/AccountCircle";
import MenuIcon from "@material-ui/icons/Menu";
import MoreVertIcon from "@material-ui/icons/MoreVert";

const App = () => {
  const token = localStorage.getItem("access-token");
  const history = useHistory();

  const [message, setMessage] = useState("");
  const [open, setOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClickOpen = () => {
    setOpen(true);
    setAnchorEl(null);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setOpen(false);
  };

  const callback = (childData) => {
    setMessage(childData);
    console.log(message);
  };

  const logout = () => {
    localStorage.removeItem("access-token");
    localStorage.removeItem("refresh-token");
    window.location.reload();
  };

  return (
    <div className="App">
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <div className="dialog">
          <label className="deleteTitle" htmlFor="">
            Logout?
          </label>
          <br />
          <br />
          <label className="deleteContent">
            Are you sure you want to logout?
          </label>
          <br />
          <br />
          <br />
          <DialogActions>
            <button onClick={logout} className="btnOk">
              OK
            </button>
            <button onClick={handleClose} className="btnOk btnCancel">
              Cancel
            </button>
          </DialogActions>
        </div>
      </Dialog>

      <AppBar position="static" color="primary">
        <Toolbar className="toolbar">
          <IconButton edge="start" color="inherit" aria-label="menu">
            <MenuIcon />
          </IconButton>
          <Typography variant="subtitle1">
            <span className="bucketList">Product Manager</span>
          </Typography>
          {token ? (
            <>
              <IconButton
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              <Menu
                id="simple-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={handleClose}>
                  <span className="menuOption">{jwt_decode(token).email}</span>
                </MenuItem>
                <MenuItem onClick={handleClickOpen}>
                  <span className="menuOption">Logout</span>
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <IconButton
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <MoreVertIcon />
              </IconButton>
              <Menu
                id="simple-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem
                  onClick={() => {
                    history.push("/");
                    setAnchorEl(null);
                  }}
                >
                  <span className="menuOption">Login</span>
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    history.push("/signup");
                    setAnchorEl(null);
                  }}
                >
                  <span className="menuOption">Register</span>
                </MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Switch>
        <Route exact path="/">
          {token ? (
            <AllProducts message={message} />
          ) : (
            <Login parentCallback={callback} message={message} />
          )}
        </Route>
        {/* <Route path="/login" component={token ? AllTodos : Login} />
        <Route path="/products" component={token ? AllTodos : Login} /> */}
        <Route path="/signup">
          {token ? (
            <AllProducts parentCallback={callback} />
          ) : (
            <Signup parentCallback={callback} />
          )}
        </Route>
        <Route path="/users/:userId/products/:productId/update">
          {token ? <UpdateProduct parentCallback={callback} /> : <Login />}
        </Route>
        <Route exact path="/users/:userId/products/:productId">
          {token ? <SingleProduct parentCallback={callback} /> : <Login />}
        </Route>
        <Route path="/users/:userId/add_product">
          {token ? <AddProduct parentCallback={callback} /> : <Login />}
        </Route>
        <Route path="/forgotPassword">
          {token ? (
            <AllProducts parentCallback={callback} />
          ) : (
            <ForgotPassWord parentCallback={callback} />
          )}
        </Route>
        <Route path="/passwordLinkSendSuccess">
          {token ? (
            <AllProducts parentCallback={callback} />
          ) : (
            <PasswordLinkSendSuccess message={message} />
          )}
        </Route>
        <Route path="/resetPassword/:resetToken">
          {token ? (
            <AllProducts parentCallback={callback} />
          ) : (
            <ResetPassword parentCallback={callback} />
          )}
        </Route>
        <Route path="/resetPasswordSuccess">
          {token ? (
            <AllProducts parentCallback={callback} />
          ) : (
            <ResetPasswordSuccess message={message} />
          )}
        </Route>
      </Switch>
      <div className="footer">
        <label htmlFor="">
          Visit<span> </span>
          <a href="https://github.com/rupam1361/React_restapi">
            https://github.com/rupam1361/React_restapi
          </a>{" "}
          <span>for more</span>
        </label>
      </div>
    </div>
  );
};

export default App;
