import React, { useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";
import Alert from "@material-ui/lab/Alert";
import MailOutlineIcon from "@material-ui/icons/MailOutline";
import VisibilityIcon from "@material-ui/icons/Visibility";
import VisibilityOffIcon from "@material-ui/icons/VisibilityOff";
import LockOpenIcon from "@material-ui/icons/LockOpen";
import CircularProgress from "@material-ui/core/CircularProgress";

const Login = (props) => {
  const url = "/api/v1/users";
  const history = useHistory();

  const email = useRef();
  const password = useRef();
  const [errors, setErrors] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [passwordVisibility, setPasswordVisibility] = useState(false);

  const login = async () => {
    if (email.current.value === "" && password.current.value === "") {
      setErrors("Email & password cannot be empty..");
    } else if (email.current.value === "") {
      setErrors("Email cannot be empty..");
    } else if (password.current.value === "") {
      setErrors("Password cannot be empty..");
    } else {
      setErrors("");
      setIsLoggingIn(true);
      try {
        const response = await axios.post(`${url}/login`, {
          email: email.current.value,
          password: password.current.value,
        });
        console.log(response.data);
        localStorage.setItem("access-token", response.data.accessToken);
        localStorage.setItem("refresh-token", response.data.refreshToken);

        props.parentCallback(response.data.message, "success");
        setIsLoggingIn(false);
      } catch (err) {
        console.log(err.response.data.message);
        setErrors(err.response.data.message);
        setIsLoggingIn(false);
      }
    }
  };

  const goToSignup = () => {
    history.push("/signup");
  };

  const goToForgotPass = () => {
    history.push("/forgotPassword");
  };

  const showPassword = () => {
    console.log("Show Password..");
    setPasswordVisibility(true);
  };

  const hidePassword = () => {
    console.log("Hide Password..");
    setPasswordVisibility(false);
  };

  return (
    <div>
      <div className="loginContainer">
        <div className="title">
          <span></span>
          <span>Login</span>
          <span></span>
        </div>
        <div className="loginWrapper">
          {props.message ? (
            <Alert severity="success">{props.message}</Alert>
          ) : null}
          <br />
          <label className="label">Email</label>
          <div className="inputWrapper">
            <MailOutlineIcon fontSize="small" className="mailIcon" />
            <input
              className="inputText"
              ref={email}
              type="text"
              placeholder="Email address..."
            />
          </div>
          <br />
          <label className="label">Password</label>
          <div className="inputWrapper">
            <LockOpenIcon fontSize="small" className="mailIcon" />
            <input
              className="inputText"
              ref={password}
              type={passwordVisibility ? "text" : "password"}
              placeholder="Password"
            />
            {passwordVisibility ? (
              <VisibilityOffIcon
                onClick={hidePassword}
                fontSize="small"
                className="visibility"
              />
            ) : (
              <VisibilityIcon
                onClick={showPassword}
                fontSize="small"
                className="visibility"
              />
            )}
          </div>
          <br />
          <p onClick={goToForgotPass} className="forgotPass">
            Forgot password?
          </p>
          <br />
          <br />
          {errors ? (
            <Alert severity="error" className="errorMessage">
              {errors}
            </Alert>
          ) : (
            <></>
          )}
          <button className="btn" onClick={login}>
            {isLoggingIn ? (
              <span className="loginLoading">
                <CircularProgress size={15} /> <span>Logging in..</span>
              </span>
            ) : (
              "Login"
            )}
          </button>
        </div>
        <label className="loginLink">
          Don't have an accout? <span onClick={goToSignup}>Signup</span>
        </label>
      </div>
    </div>
  );
};

export default Login;
