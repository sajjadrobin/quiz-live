import React from 'react';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import './App.scss';

import Client from "components/Client";

function App() {
  return (
    <Router>
      <div className="App">
        <Switch>
          <Route path="/">
            <Client/>
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
