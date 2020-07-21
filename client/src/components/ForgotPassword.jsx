import React, { useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";
import Alert from "@material-ui/lab/Alert";
import MailOutlineIcon from "@material-ui/icons/MailOutline";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import CircularProgress from "@material-ui/core/CircularProgress";

const url = "/api/v1/users";

const ForgotPass = (props) => {
  const email = useRef();
  const history = useHistory();
  const [errors, setErrors] = useState("");
  const [isSendingLink, setIsSendingLink] = useState(false);

  const sendForgotPassEmail = async () => {
    console.log("Forgot Clicked..");
    if (email.current.value === "") {
      setErrors("Email field cannot be empty..");
    } else {
      setIsSendingLink(true);
      try {
        const response = await axios.post(`${url}/forgotPassword`, {
          email: email.current.value,
        });
        console.log(response.data.message);
        props.parentCallback(response.data.message);
        setIsSendingLink(false);
        await history.push("/passwordLinkSendSuccess");
      } catch (err) {
        console.log(err.response.data.message);
        setErrors(err.response.data.message);
        setIsSendingLink(false);
      }
    }
  };

  const goBack = () => {
    history.goBack();
  };

  return (
    <div className="loginContainer">
      <div className="title">
        <ArrowBackIcon onClick={goBack} fontSize="small" />
        <span>Forgot Password?</span>
        <span></span>
      </div>
      <div className="forgotPasswordBody">
        <label>Enter your email address..</label>
        <br />
        <br />
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
        <p className="forgotPassText">
          A password reset link will be sent to this email address.. Click on
          the link to proceed..
        </p>
        {errors ? (
          <Alert severity="error" className="errorMessage">
            {errors}
          </Alert>
        ) : (
          <></>
        )}
        <br />
        <button className="btn" onClick={sendForgotPassEmail}>
          {isSendingLink ? (
            <span className="loginLoading">
              <CircularProgress size={15} /> <span>Sending Link..</span>
            </span>
          ) : (
            "Send Link"
          )}
        </button>
        <br />
      </div>
    </div>
  );
};

export default ForgotPass;
