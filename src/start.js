import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, Link, IndexRoute, IndexRedirect, hashHistory, browserHistory } from 'react-router';
import { Welcome } from './welcome';
import Registration from './registration';
import { Logo } from './logo';
import Login from './login';
import App from './app';
import Profile from './profile';
import Otheruserprofile from './otheruserprofile';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import reduxPromise from 'redux-promise';
import reducer from './reducers';
import Friends from './friends';
import { receiveFriendRequests } from './actions';
import Online from './online';
import Chat from './chat';


const store = createStore(reducer, applyMiddleware(reduxPromise));

store.subscribe(() => console.log(store.getState()));


if (location.pathname == '/welcome') {
    const router = (
        <Router history={hashHistory}>
            <Route path="/" component={Welcome}>
                <Route path="/login" component={Login} />
                <IndexRoute component={Registration} />
            </Route>
        </Router>
    );

    ReactDOM.render(router, document.querySelector('main'));

} else {

    const router = (
        <Provider store={store}>
            <Router history={browserHistory}>
                <Route path="/" component={App}>
                <IndexRoute component={Profile} />
                <Route path="/user/:id" component={Otheruserprofile}/>
                <Route path="/friends" component={Friends}/>
                <Route path="/online" component={Online}/>
                <Route path="/chat" component={Chat}/>
            </Route>
            <Route path="*">
                <IndexRedirect to='/' />
            </Route>
            </Router>
        </Provider>
    );

    ReactDOM.render(router, document.querySelector('main'));

}
