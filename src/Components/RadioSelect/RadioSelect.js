import React, { Component } from "react";

class RadioSelect extends Component {
  state = {
    selected: this.props.selected
  };

  handleChange = event => {
    this.setState({ selected: event.target.value });
  };

  render() {
    return (
      <div>
        <label className="CustomLabel">{this.props.name}</label>
        <div className="ContentRadio">
          {this.props.radiOptions.map((item, index) => (
            <div className="radioInputs" onClick={this.handleChange}>
              <input
                type="radio"
                name={this.props.name}
                value={item.text}
                checked={this.props.selected === item.text}
                onChange={this.props.click}
              />
              {item.text}
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default RadioSelect;
