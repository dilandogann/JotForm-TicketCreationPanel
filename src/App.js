import React, { Component } from "react";
import "./App.css";
import Login from "./Components/Login/Login";
import TicketHistory from "./Components/TicketHistory/TicketHistory";
import { Switch, Route } from "react-router-dom";
import Forms from "./Components/Forms/Forms";
import Integrations from "./Components/Integrations/Integrations";
import MappingMenu from "./Components/MappingMenu/MappingMenu";
import Avatar from "@material-ui/core/Avatar";
import Grid from "@material-ui/core/Grid";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      apiKey: "",
      formID: "",
      fields: [],
      integration: undefined,
      userAvatar: ""
    };
  }

  setApikey = apiKey => {
    this.setState({ apiKey });
  };

  setUserName = username => {
    this.setState({ username });
  };

  setUserAvatar = userAvatar => {
    this.setState({ userAvatar });
  };
  setFieldsnFormID = (formID, fields) => {
    this.setState({ formID });
    this.setState({ fields });
  };

  setIntegration = integration => {
    this.setState({ integration });
  };
  render() {
    return (
      <Switch>
        <Route
          exact
          path="/"
          component={() => (
            <div className="App">
              <Login
                setApikey={this.setApikey}
                setUserName={this.setUserName}
                setUserAvatar={this.setUserAvatar}
              />
            </div>
          )}
        />
        <Route
          path="/TicketHistory"
          component={() => (
            <TicketHistory
              apiKey={this.state.apiKey}
              avatar={this.state.userAvatar}
              username={this.state.username}
            />
          )}
        />
        <Route
          path="/Forms"
          component={() => (
            <Forms
              apiKey={this.state.apiKey}
              integration={this.state.integration}
              setFieldsnFormID={this.setFieldsnFormID}
              username={this.state.username}
              avatar={this.state.userAvatar}
            />
          )}
        />
        <Route
          path="/Integrations"
          component={() => (
            <Integrations
              apiKey={this.state.apiKey}
              fields={this.state.field}
              formId={this.state.formID}
              setIntegration={this.setIntegration}
              avatar={this.state.userAvatar}
            />
          )}
        />

        <Route
          path="/Mapping"
          component={() => (
            <MappingMenu
              apiKey={this.state.apiKey}
              integration={this.state.integration}
              formId={this.state.formID}
              questions={this.state.fields}
              username={this.state.username}
              avatar={this.state.userAvatar}
            />
          )}
        />
      </Switch>
    );
  }
}

export default App;
