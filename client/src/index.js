import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Switch, Route } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import App from './Components/App';
import Game from './Components/Game';

const history = createBrowserHistory();

ReactDOM.render(
	<React.StrictMode>
		<Router history={history} >
			<Route exact path="/" component={App} />
			<Route exact path="/game" component={Game} />
		</Router>
	</React.StrictMode>
	, document.getElementById('root'));
