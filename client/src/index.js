import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Switch, Route } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import App from './Components/App';

const history = createBrowserHistory();

ReactDOM.render(
	<React.StrictMode>
		<Router history={history} >
			<Route exact path="/" component={App} />
		</Router>
	</React.StrictMode>
	, document.getElementById('root'));
