import React, {Component} from "react";
import {Drawer} from "antd";

import "./Sidebar.scss";

import TopMenu from "./TopMenu";


class Sidebar extends Component{
  state = {
    drawerVisible: true
  }

  onClose() {
    this.setState({
      drawerVisible: false
    })
  }

  buildDrawer() {
    const {drawerVisible} = this.state;
    return (
      <Drawer
        placement={"right"}
        closable={false}
        onClose={() => this.onClose()}
        visible={drawerVisible}
        getContainer={false}
        className="sidebar"
        width={453}
        mask={false}
      >
        <TopMenu/>
      </Drawer>
    )
  }

  render() {
    return(
      <div className="fixed-sidebar">
        <TopMenu/>
      </div>
    )
  }
}

export default Sidebar;
