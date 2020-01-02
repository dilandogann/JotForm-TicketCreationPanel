import React, { Component } from "react";
import "../../Assets/Css/TicketHistory.scss";
import { Redirect } from "react-router";
import { Link } from "react-router-dom";
import Avatar from "@material-ui/core/Avatar";
import Grid from "@material-ui/core/Grid";

class TicketHistory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      TicketInfo: []
    };
  }

  componentDidMount = () => {
    const username = this.props.username;
    let integration_data = new FormData();
    integration_data.append("username", username);
    fetch("http://localhost/my-app/src/PHP/ticketValues.php", {
      method: "POST",
      header: {
        "Content-Type": "text/plain"
      },
      body: integration_data
    })
      .then(response => response.json())
      .then(response => {
        response.ticketfields.forEach(element => {
          var result = JSON.parse(element.values);
          this.setState({
            TicketInfo: [
              ...this.state.TicketInfo,
              {
                name: result.description,
                file: element.file,
                createdAt: element.createdAt,
                integration: element.intg,
                form: element.form
              }
            ]
          });
        });
      });
  };
  render() {
    if (this.props.apiKey == "") {
      return <Redirect to="/" />;
    }
    return (
      <div>
        <div className="containerTickets">
          <div>
            <img
              className="mascot"
              src="https://cdn.jotfor.ms/myforms3/img/mascot_my_forms.png"
            ></img>
          </div>
          <div className="TicketHistoryLogoTickets"></div>
          <Link to="/Forms">
            <div className="logoForm"> </div>
          </Link>
          <div>
            <Link to="/Integrations">
              <div className="logoEntegration"> </div>
            </Link>
            <div className="logoMappingfields"> </div>
            <div className="containerCard">
              <h1 className="h1-header">Recently Created Tickets</h1>

              <Grid
                className="grid"
                container
                justify="center"
                alignItems="center"
                id="avatar"
              >
                <Avatar
                  className="avatarticketHistory"
                  src={this.props.avatar}
                />
              </Grid>
              <div className="liContent">
                <ul>
                  {this.state.TicketInfo.map((element, index) => (
                    <li className="liAlign" key={index}>
                      <div className=" article-wrapper">
                        <article>
                          {element.integration == "Freshdesk" ? (
                            <div
                              className={"img-wrapperFreshdesk"}
                              style={{
                                backgroundImage: `url(${element.file})`
                              }}
                            ></div>
                          ) : (
                            <div
                              className="img-wrapperZendesk"
                              style={{
                                backgroundImage: `url(${element.file})`
                              }}
                            ></div>
                          )}
                          <div className="ticketName">{element.name}</div>
                          <p className="formname">{element.form}</p>
                          <div className="ticketDate">{element.createdAt}</div>
                        </article>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default TicketHistory;
