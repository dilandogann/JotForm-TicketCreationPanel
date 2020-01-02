import React, { Component } from "react";
import "../../Assets/Css/Integrations.css";
import "../../Assets/Css/Custom.css";
import { Link } from "react-router-dom";
import { Redirect } from "react-router";
import Avatar from "@material-ui/core/Avatar";
import Grid from "@material-ui/core/Grid";

class Integrations extends Component {
  constructor(props) {
    super(props);
    this.state = {
      Integrations: []
    };
  }

  componentWillMount = () => {
    let integration_data = new FormData();
    integration_data.append("operation", "all");
    fetch("http://localhost/my-app/src/PHP/getIntegrations.php", {
      method: "POST",
      header: {
        "Content-Type": "text/plain"
      },
      body: integration_data
    })
      .then(response => response.json())
      .then(response => {
        response.fields.forEach(element => {
          this.setState({
            Integrations: [
              ...this.state.Integrations,
              {
                name: element.name,
                description: element.description,
                file: element.file,
                clicked: false
              }
            ]
          });
        });
      });
  };
  showQuestionMappers = integration => {
    this.props.setIntegration(integration);
  };

  render() {
    if (this.props.apiKey === "") {
      return <Redirect to="/" />;
    }
    return (
      <div>
        <div className="containerTickets">
          <img
            className="mascot"
            src="https://cdn.jotfor.ms/myforms3/img/mascot_my_forms.png"
          ></img>
          <div>
            <Link to="/TicketHistory">
              <div className="LogoTickets"></div>
            </Link>
            <Link to="/Forms">
              <div className="logoForm"> </div>
            </Link>
            <div className="IntegrationLogoEntegration"> </div>
            <div className="logoMappingfields"> </div>
            <div className="containerCard">
              <Grid
                className="grid"
                container
                justify="center"
                alignItems="center"
                id="avatar"
              >
                <Avatar className="avatar" src={this.props.avatar} />
              </Grid>
              <ul className="IntgWrap">
                {this.state.Integrations.map((element, index) => (
                  <li key={index}>
                    <div className="card" id={index} key={index}>
                      <div
                        className={element.name}
                        style={{ backgroundImage: `url(./${element.file})` }}
                      ></div>
                      <div className="bar">
                        <h3 className="title">{element.name}</h3>
                        <p className="p-Integrations">{element.description}</p>
                        <Link to="/Mapping">
                          <div
                            className="buttonChoose"
                            onClick={() =>
                              this.showQuestionMappers(element.name)
                            }
                          >
                            Choose Integration
                          </div>
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default Integrations;
