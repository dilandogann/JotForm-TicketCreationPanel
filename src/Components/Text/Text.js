import React, { Component } from "react";
import "../../Assets/Css/MappingMenu.scss";

class Text extends Component {
  constructor() {
    super();
  }

  render() {
    return (
      <div>
        <label className="CustomLabel">{this.props.name}</label>
        <input
          id={this.props.name}
          className="inputFields"
          autocomplete="off"
          name={this.props.name}
          value={this.props.selected}
          type="text"
          onChange={this.props.click}
        />
      </div>
    );
  }
}

export default Text;
