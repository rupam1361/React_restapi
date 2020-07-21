import React from "react";
import { useHistory } from "react-router-dom";
import Alert from "@material-ui/lab/Alert";

const PasswordLinkSendSuccess = (props) => {
  const history = useHistory();
  const goToLogin = async () => {
    history.push("/");
  };

  return (
    <div className="loginContainer">
      <div className="title">Congratulations..</div>
      <div className="passwordLinkBody">
        {props.message ? (
          <Alert severity="success" className="errorMessage">
            {props.message}
          </Alert>
        ) : (
          <></>
        )}
        <br />
        <button className="btn" onClick={goToLogin}>
          Ok
        </button>
      </div>
    </div>
  );
};

export default PasswordLinkSendSuccess;
