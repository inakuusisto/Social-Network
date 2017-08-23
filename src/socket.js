import React from 'react';
import { connect } from 'react-redux';
import { onlineUsers, userJoined, userLeft, chatMessages, chatMessage, friendRequests } from './actions';
import { newFriendRequest } from './actions';
import { acceptPendingRequest } from './actions';
import * as io from 'socket.io-client';
import axios from 'axios';

let socket;

class Socket extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};

    }

    componentDidMount() {

        if(!socket) {
            socket = io.connect();
            socket.on('connect', function() {
                axios.get('/connected/' + socket.id)
                    .then(function(response) {
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
            });
            socket.on('onlineUsers', (users) => {
                this.props.dispatch(onlineUsers(users));
            });
            socket.on('userJoined', (newUser) => {
                this.props.dispatch(userJoined(newUser));
            });
            socket.on('userLeft', (leavingUser) => {
                this.props.dispatch(userLeft(leavingUser));
            });
            socket.on('chatMessages', (messages) => {
                this.props.dispatch(chatMessages(messages));
            });
            socket.on('chatMessage', (newMessage) => {
                this.props.dispatch(chatMessage(newMessage));
            });
            socket.on('friendRequests', (requests) => {
                this.props.dispatch(friendRequests(requests));
            });
            socket.on('newFriendRequest', (newRequest) => {
                this.props.dispatch(newFriendRequest(newRequest));
            });
            socket.on('acceptPendingRequest', (changeOfRequests) => {
                this.props.dispatch(acceptPendingRequest(changeOfRequests));
            });

            this.setState({state: 1});
        }

    }

    render(props) {

        if(!this.state.state) {
            return null;
        }

        const children = React.cloneElement(this.props.children, {
            socket: socket
        });
        return children;
    }
}


export default connect()(Socket);
