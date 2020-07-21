import React, { useRef, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import axios from "axios";
import Alert from "@material-ui/lab/Alert";
import VisibilityIcon from "@material-ui/icons/Visibility";
import VisibilityOffIcon from "@material-ui/icons/VisibilityOff";
import LockOpenIcon from "@material-ui/icons/LockOpen";
import CircularProgress from "@material-ui/core/CircularProgress";

const url = "/api/v1/users";

const ResetPassword = (props) => {
  const password = useRef();
  const confirmPassword = useRef();
  const history = useHistory();
  const { resetToken } = useParams();
  const [errors, setErrors] = useState("");
  const [passwordVisibility, setPasswordVisibility] = useState(false);
  const [confirmPasswordVisibility, setConfirmPasswordVisibility] = useState(
    false
  );
  const [resettingPassword, setResettingPassword] = useState(false);

  const resetPassword = async () => {
    console.log(resetToken);
    if (password.current.value === "" && confirmPassword.current.value === "") {
      setErrors("Password & Confirm Password cannot be empty..");
    } else if (password.current.value === "") {
      setErrors("Password cannot be empty..");
    } else if (confirmPassword.current.value === "") {
      setErrors("Confirm password cannot be empty..");
    } else {
      setErrors("");
      setResettingPassword(true);
      try {
        const response = await axios.post(`${url}/resetPassword`, {
          passwordResetLink: resetToken,
          password: password.current.value,
          confirmPassword: confirmPassword.current.value,
        });
        console.log(response.data.message);
        props.parentCallback(response.data.message);
        setResettingPassword(false);
        history.push("/resetPasswordSuccess");
      } catch (err) {
        if (err) {
          console.log(err.response.data.message);
          setErrors(err.response.data.message);
          setResettingPassword(false);
        }
      }
    }
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
        <span>Reset your password...</span>
        <span></span>
      </div>
      <div className="forgotPasswordBody">
        <label>New password..</label>
        <br />
        <div className="inputWrapper">
          <LockOpenIcon fontSize="small" className="mailIcon" />
          <input
            className="inputText"
            ref={password}
            type={passwordVisibility ? "text" : "password"}
            placeholder="Password..."
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
        <label>Confirm password..</label>
        <br />
        <div className="inputWrapper">
          <LockOpenIcon fontSize="small" className="mailIcon" />
          <input
            className="inputText"
            ref={confirmPassword}
            type={confirmPasswordVisibility ? "text" : "password"}
            placeholder="Confirm password..."
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
        <button className="btn" onClick={resetPassword}>
          {resettingPassword ? (
            <span className="loginLoading">
              <CircularProgress size={15} /> <span>Resetting..</span>
            </span>
          ) : (
            "Reset"
          )}
        </button>
        <br />
      </div>
    </div>
  );
};

export default ResetPassword;
