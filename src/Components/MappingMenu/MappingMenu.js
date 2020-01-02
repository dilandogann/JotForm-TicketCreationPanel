import React, { Component } from "react";
import DropDrownSelect from "../DropDownSelect/DropDownSelect";
import RadioSelect from "../RadioSelect/RadioSelect";
import TextSelect from "../TextSelect/TextSelect";
import Text from "../Text/Text";
import { Redirect } from "react-router";
import { Link } from "react-router-dom";
import Avatar from "@material-ui/core/Avatar";
import Grid from "@material-ui/core/Grid";
import "../../Assets/Css/MappingMenu.scss";
import "../../Assets/Css/Custom.css";

class MappingMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      Requirements: [],
      MappingFields: [],
      FieldOptions: []
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleChangeText = this.handleChangeText.bind(this);
    this.handleTextField = this.handleTextField.bind(this);
  }
  componentWillMount = () => {
    let Fields = [];
    const formId = this.props.formId;
    const username = this.props.username;
    let integration_data = new FormData();
    integration_data.append("formId", formId);
    integration_data.append("operation", "one");
    integration_data.append("username", username);
    integration_data.append("integration", this.props.integration);
    fetch("http://localhost/my-app/src/PHP/getIntegrations.php", {
      method: "POST",
      header: {
        "Content-Type": "text/plain"
      },
      body: integration_data
    })
      .then(response => response.json())
      .then(response => {
        response.requirements.forEach(req => {
          this.setState({
            Requirements: [
              ...this.state.Requirements,
              {
                name: req.text,
                selected: req.value
              }
            ]
          });
        });
        response.fields.forEach((field, index) => {
          Fields.push({
            name: field.field,
            fields: this.props.questions,
            inputType: field.inputType
          });

          if (field.inputType == "Dropdown") {
            if (field.value == "") {
              Fields[index].selected = "";
            } else {
              this.props.questions.forEach(questField => {
                if (questField.id == field.value) {
                  Fields[index].selected = questField.id;
                  Fields[index].def = questField.value;
                }
              });
            }
          } else {
            Fields[index].selected = field.value;
            Fields[index].def = field.value;
            if (field.inputType == "Radio") {
              response.options.forEach(element => {
                if (element.field == field.field) {
                  this.setState({
                    FieldOptions: [
                      ...this.state.FieldOptions,
                      {
                        text: element.fieldoption
                      }
                    ]
                  });
                }
              });
              Fields[index].RadioFields = this.state.FieldOptions;
              this.setState({ FieldOptions: [] });
            }
          }
        });
      });

    setTimeout(() => {
      this.setState({ MappingFields: Fields });
    }, 100);
  };

  handleSubmit = event => {
    let fieldsArray = [];
    this.state.MappingFields.map(element => {
      fieldsArray.push({
        name: element.name,
        selected: element.selected,
        inputType: element.inputType
      });
    });

    let reqArray = this.state.Requirements;
    const formId = this.props.formId;
    const username = this.props.username;
    let answerFields = new FormData();
    answerFields.append("formId", formId.toString());
    answerFields.append("integration", this.props.integration);
    answerFields.append("username", username);
    answerFields.append("integrationfields", JSON.stringify(fieldsArray));
    answerFields.append("requirementfields", JSON.stringify(reqArray));
    fetch("http://localhost/my-app/src/PHP/mapingFieldSelections.php", {
      method: "POST",
      header: {
        "Content-Type": "text/plain"
      },
      body: answerFields
    }).then(response => response.json());
  };

  handleChange = event => {
    let MappingFields = this.state.MappingFields;
    MappingFields.forEach(item => {
      if (item.name == event.currentTarget.name)
        item.selected = event.currentTarget.value;
    });

    this.setState({ MappingFields: MappingFields });
  };

  handleChangeText = event => {
    let Requirements = this.state.Requirements;
    Requirements.forEach(item => {
      if (item.name == event.currentTarget.name)
        item.selected = event.currentTarget.value;
    });

    this.setState({ Requirements: Requirements });
  };

  handleTextField = (itemName, input) => {
    let MappingFields = this.state.MappingFields;
    MappingFields.forEach(item => {
      if (item.name == itemName) item.selected = input;
    });
    this.setState({ MappingFields: MappingFields });
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
            <Link to="/Integrations">
              <div className="logoEntegration"> </div>
            </Link>
            <div className="MappingLogoMap"> </div>
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
              <div className="TicketSection">
                <form className="TicketForm">
                  <h2> {this.props.integration} ticket values</h2>
                  <ul>
                    {this.state.MappingFields.map((form, index) =>
                      (() => {
                        switch (form.inputType) {
                          case "Radio":
                            return (
                              <li key={index}>
                                <RadioSelect
                                  name={form.name}
                                  radiOptions={form.RadioFields}
                                  click={this.handleChange}
                                  selected={form.selected}
                                />
                              </li>
                            );
                          case "Text":
                            return (
                              <li key={index}>
                                <TextSelect
                                  name={form.name}
                                  fields={form.fields}
                                  clickTextField={this.handleTextField}
                                  selected={form.selected}
                                />
                              </li>
                            );

                          case "Dropdown":
                            return (
                              <li key={index}>
                                <DropDrownSelect
                                  def={form.def}
                                  name={form.name}
                                  fields={form.fields}
                                  click={this.handleChange}
                                  selected={form.selected}
                                />
                              </li>
                            );
                          default:
                            return <h1> Empty</h1>;
                        }
                      })()
                    )}
                  </ul>

                  <h2>Authantication values</h2>
                  <ul>
                    {this.state.Requirements.map((item, index) => (
                      <li key={index}>
                        <Text
                          key={index}
                          name={item.name}
                          selected={item.selected}
                          click={this.handleChangeText}
                        />
                      </li>
                    ))}
                  </ul>
                  <div className="Mapping-Buttons">
                    <Link to="/Integrations">
                      <div id="back-btn" onClick={this.handleBack}>
                        &laquo; Back Integrations
                      </div>
                    </Link>
                    <Link to="/Forms">
                      <div id="submit-btn" onClick={this.handleSubmit}>
                        Save and Done! &raquo;
                      </div>
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default MappingMenu;
