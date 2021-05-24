import React from 'react';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import './App.scss';

import Client from "components/Client";
import Sidebar from "components/Sidebar";
import Signup from "components/Signup";

function App() {
  return (
    <Router>
      <div className="App">
        <Switch>
          <Route path="/signup">
            <Signup/>
          </Route>
          <Route path="/">
            <Client/>
            <Sidebar/>
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
