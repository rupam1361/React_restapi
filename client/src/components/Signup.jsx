import React, { useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";
import Alert from "@material-ui/lab/Alert";
import PersonOutlineIcon from "@material-ui/icons/PersonOutline";
import MailOutlineIcon from "@material-ui/icons/MailOutline";
import LockOpenIcon from "@material-ui/icons/LockOpen";
import CircularProgress from "@material-ui/core/CircularProgress";
import VisibilityIcon from "@material-ui/icons/Visibility";
import VisibilityOffIcon from "@material-ui/icons/VisibilityOff";

const Signup = (props) => {
  const history = useHistory();
  const username = useRef("");
  const email = useRef("");
  const password = useRef("");
  const confirmPassword = useRef("");
  const [errors, setErrors] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [passwordVisibility, setPasswordVisibility] = useState(false);
  const [confirmPasswordVisibility, setConfirmPasswordVisibility] = useState(
    false
  );

  const url = "/api/v1/users";

  const signup = async () => {
    if (
      username.current.value === "" &&
      email.current.value === "" &&
      password.current.value === "" &&
      confirmPassword.current.value === ""
    ) {
      setErrors("All fields are required..");
    } else if (username.current.value === "") {
      setErrors("Username cannot be empty..");
    } else if (email.current.value === "") {
      setErrors("Email cannot be empty..");
    } else if (password.current.value === "") {
      setErrors("Password cannot be empty..");
    } else if (confirmPassword.current.value === "") {
      setErrors("Confirm cannot be empty..");
    } else {
      setErrors("");
      setIsLoggingIn(true);
      try {
        const response = await axios.post(`${url}/signup`, {
          username: username.current.value,
          email: email.current.value,
          password: password.current.value,
          confirmPassword: confirmPassword.current.value,
        });
        props.parentCallback(response.data.message);
        setIsLoggingIn(false);
        history.push("/");
        console.log(response.data.message);
      } catch (err) {
        if (err) {
          console.log(err.response.data.message);
          setErrors(err.response.data.message);
          setIsLoggingIn(false);
        }
      }
    }
  };

  const goToLogin = () => {
    history.push("/");
  };

  const showPassword = () => {
    console.log("Show Password..");
    setPasswordVisibility(true);
  };

  const hidePassword = () => {
    console.log("Hide Password..");
    setPasswordVisibility(false);
  };

  const showConfirmPassword = () => {
    console.log("Show Password..");
    setConfirmPasswordVisibility(true);
  };

  const hideConfirmPassword = () => {
    console.log("Hide Password..");
    setConfirmPasswordVisibility(false);
  };

  return (
    <div className="loginContainer">
      <div className="title">
        <span></span>
        <span>Signup</span>
        <span></span>
      </div>
      <br />
      <div className="signupWrapper">
        <label className="label">Username</label>
        <br />
        <div className="inputWrapper">
          <PersonOutlineIcon fontSize="small" className="mailIcon" />
          <input
            className="inputText"
            ref={username}
            type="text"
            placeholder="Username..."
          />
        </div>
        <br />
        <label className="label">Email</label>
        <br />
        <div className="inputWrapper">
          <MailOutlineIcon fontSize="small" className="mailIcon" />
          <input
            className="inputText"
            ref={email}
            type="text"
            placeholder="Email..."
          />
        </div>
        <br />
        <label className="label">Password</label>
        <br />
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
        <label className="label">Confirm Password</label>
        <br />
        <div className="inputWrapper">
          <LockOpenIcon fontSize="small" className="mailIcon" />
          <input
            className="inputText"
            ref={confirmPassword}
            type={confirmPasswordVisibility ? "text" : "password"}
            placeholder="Password"
          />
          {confirmPasswordVisibility ? (
            <VisibilityOffIcon
              onClick={hideConfirmPassword}
              fontSize="small"
              className="visibility"
            />
          ) : (
            <VisibilityIcon
              onClick={showConfirmPassword}
              fontSize="small"
              className="visibility"
            />
          )}
        </div>
        <br />
        {errors ? (
          <Alert severity="error" className="errorMessage">
            {errors}
          </Alert>
        ) : (
          <></>
        )}

        <button className="btn" onClick={signup}>
          {isLoggingIn ? (
            <span className="loginLoading">
              <CircularProgress size={15} /> <span>Creating account..</span>
            </span>
          ) : (
            "SignUp"
          )}
        </button>
      </div>
      <label className="signupLink">
        Already have an accout? <span onClick={goToLogin}>Login</span>
      </label>
    </div>
  );
};

export default Signup;
