import React, { Component } from "react";
import "../../Assets/Css/TextSelect.css";
class TextSelect extends Component {
  constructor(props) {
    super(props);
    this.state = { Content: "" };
    this.handleChange = this.handleChange.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
  }

  componentDidMount = () => {
    var div = document.getElementById(this.props.name);
    var selectedFields = this.props.selected;
    let flag = true;
    while (flag == true) {
      if (selectedFields.includes("{")) {
        let phaIndex = selectedFields.indexOf("{");
        if (phaIndex != 0) {
          let textField = selectedFields.substring(0, phaIndex);
          div.innerText += textField;
        }
        let closeIndex = selectedFields.indexOf("}");
        let divId = selectedFields.substring(phaIndex + 1, closeIndex);
        let divTextContent = "";
        this.props.fields.forEach(field => {
          if (field.id == divId) divTextContent = field.value;
        });
        this.createTag(divId, divTextContent, div);
        if (closeIndex + 1 < selectedFields.length)
          selectedFields = selectedFields.substring(closeIndex + 1);
        else flag = false;
      } else {
        let textField = selectedFields;
        div.innerText += textField;
        flag = false;
      }
    }
  };

  createTag = (id, textContent, div) => {
    var newDiv = document.createElement("button");
    newDiv.contentEditable = false;
    newDiv.id = id;
    newDiv.className = "inputTag";
    newDiv.textContent = textContent;
    newDiv.onclick = event => {
      event.preventDefault();
    };
    var newbutton = document.createElement("button");
    newDiv.appendChild(newbutton);
    div.appendChild(newDiv);

    newbutton.contentEditable = false;
    newbutton.className = "inputButton";
    newbutton.textContent = "+";
    newbutton.onclick = event => {
      event.preventDefault();
      div.removeChild(document.getElementById(id));
      this.updateContent(div);
    };
  };
  updateContent = div => {
    let textValue = "";
    div.childNodes.forEach(child => {
      if (child.nodeName == "#text") {
        textValue += child.textContent;
      } else if (child.nodeName == "BUTTON") {
        if (child.id != "") textValue += "{" + child.id + "}";
      }
    });
    this.props.clickTextField(this.props.name, textValue);
  };

  handleSelect = e => {
    let value = e.target.value;
    let divId = "";

    this.props.fields.forEach(element => {
      if (element.value == value) divId = element.id;
    });

    var div = document.getElementById(this.props.name);
    this.createTag(divId, e.target.value, div);
    this.updateContent(div);
  };
  handleChange = () => {
    let div = document.getElementById(this.props.name);
    if (div) {
      div.addEventListener("input", function() {}, false);
    }
    this.updateContent(div);
  };

  render() {
    return (
      <div className="textSelectMain">
        <label className="CustomLabel">{this.props.name}</label>
        <div className="DivTextSelect">
          <div
            className="TagDiv"
            contentEditable="true"
            id={this.props.name}
            ref="chart"
            onKeyUp={this.handleChange}
          ></div>
          <select
            className="DropdownText"
            name={this.props.name}
            onChange={this.handleSelect}
          >
            <option value=""></option>
            {this.props.fields.map(values => (
              <option value={values.value} key={values.id}>
                {values.value}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }
}

export default TextSelect;
