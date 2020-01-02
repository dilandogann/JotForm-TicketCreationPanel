import React, { Component } from "react";

class DropDrownSelect extends Component {
  render() {
    return (
      <div>
        <label className="CustomLabel">{this.props.name}</label>
        <select
          name={this.props.name}
          className="DropdownCustom"
          required={this.props.required}
          onChange={this.props.click}
        >
          <option value=""></option>
          {this.props.fields.map(values => (
            <option
              selected={this.props.def == values.value}
              value={values.id}
              key={values.id}
            >
              {values.value}
            </option>
          ))}
        </select>
      </div>
    );
  }
}

export default DropDrownSelect;
