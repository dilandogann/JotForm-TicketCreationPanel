import React, { Component } from "react";
import axios from "axios";
import "../../Assets/Css/Forms.css";
import "../../Assets/Css/Custom.css";
import { Redirect } from "react-router";
import { Link } from "react-router-dom";
import Avatar from "@material-ui/core/Avatar";
import Grid from "@material-ui/core/Grid";

class Forms extends Component {
  constructor(props) {
    super(props);
    this.state = {
      Forms: []
    };
  }
  componentWillMount = () => {
    let apiKey = this.props.apiKey;
    let url = "https://api.jotform.com/user/forms?apiKey=" + apiKey;
    axios
      .get(url)
      .then(response => response.data)
      .then(data => {
        data.content.forEach(element => {
          this.setState({
            Forms: [
              ...this.state.Forms,
              {
                title: element["title"],
                id: element["id"],
                lastSub: element["last_submission"],
                submissionNum: element["count"]
              }
            ]
          });
        });
      });
  };

  getQuestionFieldsHandler = id => {
    let QuestionFields = [];
    let apiKey = this.props.apiKey;
    let url =
      " https://api.jotform.com/form/" + id + "/questions?apiKey=" + apiKey;
    let qidArray = [];
    axios
      .get(url)
      .then(response => response.data)
      .then(data => {
        this.setState({ Questions: data.content });
        let counter = 0;
        for (var element in data.content) {
          qidArray.push(element);
        }
        for (var i = 0; i < qidArray.length; i++) {
          counter = parseInt(qidArray[i], 10);
          if (data.content[counter] != null) {
            if (data.content[counter].text != null) {
              var html = data.content[counter].text;
              html = html.replace(/<br>/g, "");
              var div = document.createElement("div");
              div.innerHTML = html;
              var text = div.textContent || div.innerText || "";
              if (
                data.content[counter].type != "control_head" &&
                data.content[counter].type != "control_button"
              ) {
                QuestionFields.push({
                  value: text,
                  id:
                    data.content[counter].qid + "_" + data.content[counter].text
                });
              }
            }
            if (data.content[counter].sublabels != null) {
              for (var value in data.content[counter].sublabels) {
                if (data.content[counter].sublabels.hasOwnProperty(value)) {
                  if (data.content[counter].text != null) {
                    var html = data.content[counter].text;
                    html = html.replace(/<br>/g, "");
                    var div = document.createElement("div");
                    div.innerHTML = html;
                    var text = div.textContent || div.innerText || "";
                    QuestionFields.push({
                      value:
                        text + "/" + data.content[counter].sublabels[value],
                      id: data.content[counter].qid + "_" + text + "/" + value
                    });
                  }
                }
              }
            }
          }
        }
      });
    this.props.setFieldsnFormID(id, QuestionFields);
  };
  createTicket = (id, title) => {
    let list = [];
    let apiKey = this.props.apiKey;
    let username = this.props.username;
    let ticket_data = new FormData();
    ticket_data.append("formId", id);
    ticket_data.append("formName", title);
    ticket_data.append("apiKey", apiKey);
    ticket_data.append("username", username);
    ticket_data.append("integration", this.props.integration);
    const url = "http://localhost/my-app/src/PHP/createTicket.php";
    fetch(url, {
      method: "POST",
      header: {
        "Content-Type": "text/plain"
      },
      body: ticket_data
    })
      .then(resp => resp.json())
      .then(resp => {
        let oneTicket = [];
        resp.fields.forEach(element => {
          oneTicket.push({
            Field: "Submission ID",
            Answer: element.submissionId
          });
          element.ticket.forEach(object => {
            oneTicket.push({ Field: object.field, Answer: object.answer });
          });
          list.push(oneTicket);
        });
      });
  };
  render() {
    if (this.props.apiKey === "") {
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
          <Link to="/TicketHistory">
            <div className="LogoTickets"></div>
          </Link>
          <div className="FormsLogoForms"> </div>
          <Link to="/Integrations">
            <div className="logoEntegration"> </div>
          </Link>
          <div className="logoMappingfields"> </div>

          <div>
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
              <ul className="tilesWrap">
                {this.state.Forms.map((element, index) => (
                  <li key={index}>
                    <h2>{index + 1}</h2>
                    <h3>{element.title}</h3>
                    <p>
                      {element.submissionNum +
                        " Submission. Last submission on " +
                        element.lastSub}
                    </p>
                    <Link to="/Integrations">
                      <button
                        onClick={() =>
                          this.getQuestionFieldsHandler(element.id)
                        }
                      >
                        Integrations
                      </button>
                    </Link>
                    <button
                      style={{ left: "100px" }}
                      onClick={() =>
                        this.createTicket(element.id, element.title)
                      }
                    >
                      Create Ticket
                    </button>
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
export default Forms;
