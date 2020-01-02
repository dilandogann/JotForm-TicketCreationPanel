import React, { Component } from "react";
import "../../Assets/Css/Login.css";
import _ from "lodash";
import TicketHistory from "../TicketHistory/TicketHistory";
import { Redirect } from "react-router";

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLogin: true
    };
  }
  userLogin = () => {
    const { setUserName } = this.props;
    const { setApikey } = this.props;
    const { setUserAvatar } = this.props;
    let appKey = "";
    let username = "";
    let userAvatar = "";
    var user = {
      username: document.getElementById("username").value,
      password: document.getElementById("password").value,
      appName: "Application Name",
      access: "Access type"
    };

    window.JF.userLogin(user, function(response) {
      appKey = response.appKey;
      username = response.username;
      userAvatar = response.avatarUrl;
      setApikey(appKey);
      setUserName(username);
      setUserAvatar(userAvatar);
      let user_data = new FormData();
      user_data.append("username", response.username);
      user_data.append("name", response.name);
      user_data.append("email", response.email);

      fetch("http://localhost/my-app/src/PHP/insertUsers.php", {
        method: "POST",
        header: {
          "Content-Type": "text/plain"
        },
        body: user_data
      });
    });
    this.setState({ isLogin: false });
  };

  render() {
    if (!this.state.isLogin) {
      return <Redirect to="/TicketHistory" />;
    }
    return (
      <div>
        <div className="Login-Background">
          <div className="Login-Modal">
            <p className="Login-p">Login with JotForm</p>
            <div className="Login-InputContent">
              <h4 className="Login-h4">Username</h4>
              <input
                className="Login-Input"
                type="text"
                id="username"
                autocomplete="off"
              />
              <h4 className="Login-h4">Password</h4>
              <input type="password" className="Login-Input" id="password" />
              <div className="Login-Button" onClick={this.userLogin}>
                Login
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default Login;
